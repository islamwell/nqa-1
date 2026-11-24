import db from "./db";
import categories from "../data/category-strcture";
import fuzzysort from "fuzzysort";

const synonymGroups = [
    ["quran", "koran"],
    ["hadith", "hadis", "hadees"],
    ["azan", "adhan", "athan"],
    ["ramadan", "ramzan", "ramadhan"],
    ["namaz", "salah", "salat"],
];

export const escapeRegex = (str) => String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const buildSearchRegex = (searchText) => {
    if (!searchText) return null;
    if (searchText.startsWith('"')) {
        const cleaned = searchText.replace(/"/g, "");
        try {
            return new RegExp(escapeRegex(cleaned), 'i');
        } catch (_) {
            return null;
        }
    }
    const words = searchText.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return null;

    try {
        const regexParts = words.map(word => {
            let variants = [escapeRegex(word)];
            for (const group of synonymGroups) {
                if (group.includes(word)) {
                    variants = group.map(escapeRegex);
                    break;
                }
            }
            return `(?=.*\\b(?:${variants.join('|')}))`;
        });
        return new RegExp(`^${regexParts.join('')}.*`, 'i');
    } catch (_) {
        return null;
    }
};

const pageSize = 10;

export const addAudio = async (data) => {
    return db.table("audioList").bulkPut(data);
};

export const getAudioByName = async (searchText, page) => {
    const HARD_LIMIT = 10000;
    // https://github.com/dfahlander/Dexie.js/issues/838
    try {
        const allItems = await db.table("audioList").limit(HARD_LIMIT).toArray();
        const regex = buildSearchRegex(searchText);
        if (!regex) return { data: [], allpage: 1 };

        let filtered = allItems.filter(item => regex.test(item.name)).map(item => ({
            ...item,
            highlightName: item.name
        }));
        if (allItems.length === HARD_LIMIT) {
            // We didn't get all data in first try.
            // Need to continue filtering one by one:
            const rest = await db
                .table("audioList")
                .offset(HARD_LIMIT)
                .toArray();

            const filteredRest = rest.filter(item => regex.test(item.name)).map(item => ({
                ...item,
                highlightName: item.name
            }));

            filtered = filtered.concat(filteredRest);
        }

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const data = filtered.slice(start, end);
        const allpage = Math.ceil(filtered.length / pageSize);

        return { data, allpage };
    } catch (error) {
        throw error;
    }
};

export const getAudioById = async (id) => {
    return db.table("audioList").get({ id: id.toString() });
};

export const getDescendantCategoryIds = (categoryId) => {
    if (categoryId === undefined || categoryId === null || categoryId === "") return [];
    const root = getCategoryById(categoryId);
    if (!root) return [categoryId];

    const rootsToWalk = [root];
    if (root.parentId !== undefined && root.parentId !== null && String(root.parentId) !== "0") {
        const parent = getCategoryById(root.parentId);
        const normRootName = normalizeCategoryName(root.name)?.toLowerCase();
        if (parent && Array.isArray(parent.subCategories) && normRootName) {
            for (const sib of parent.subCategories) {
                if (
                    sib &&
                    String(sib.id) !== String(root.id) &&
                    normalizeCategoryName(sib.name)?.toLowerCase() === normRootName
                ) {
                    rootsToWalk.push(sib);
                }
            }
        }
    }

    const ids = [];
    const visited = new Set();
    const walk = (node) => {
        if (!node || node.id === undefined || node.id === null) return;
        const strId = String(node.id);
        if (visited.has(strId)) return;
        visited.add(strId);
        ids.push(node.id);
        if (Array.isArray(node.subCategories)) {
            for (const child of node.subCategories) {
                walk(child);
            }
        }
    };
    for (const r of rootsToWalk) {
        walk(r);
    }
    return ids;
};

export const getAudioByCategory = async (categoryId, page = 1) => {
    try {
        if (categoryId === undefined || categoryId === null || categoryId === "") {
            return { data: [], allpage: 1 };
        }

        const targetIds = getDescendantCategoryIds(categoryId);
        const categoryOrder = new Map();
        const idSet = new Set();
        const queryKeys = [];
        const seenKeys = new Set();

        targetIds.forEach((id, index) => {
            const strId = String(id);
            categoryOrder.set(strId, index);
            idSet.add(strId);
            if (!seenKeys.has(strId)) {
                seenKeys.add(strId);
                queryKeys.push(strId);
            }
            const numId = Number(id);
            if (!Number.isNaN(numId) && !seenKeys.has(numId)) {
                seenKeys.add(numId);
                queryKeys.push(numId);
            }
        });

        let items = [];
        try {
            const table = db.table("audioList");
            if (targetIds.length === 1) {
                const strId = String(targetIds[0]);
                const numId = Number(targetIds[0]);
                items = !Number.isNaN(numId)
                    ? await table.where("category_id").equals(numId).or("category_id").equals(strId).toArray()
                    : await table.where("category_id").equals(strId).toArray();
            } else {
                items = await table.where("category_id").anyOf(queryKeys).toArray();
            }
        } catch (_) {
            const allItems = await db.table("audioList").toArray();
            items = allItems.filter((item) => idSet.has(String(item.category_id)));
        }

        // Deduplicate by ID and preserve tree order -> order_number -> id
        const uniqueMap = new Map();
        items.forEach((item) => {
            if (item && item.id !== undefined && !uniqueMap.has(String(item.id))) {
                uniqueMap.set(String(item.id), item);
            }
        });
        const uniqueItems = Array.from(uniqueMap.values());
        uniqueItems.sort((a, b) => {
            const catOrderA = categoryOrder.get(String(a.category_id)) ?? Number.MAX_SAFE_INTEGER;
            const catOrderB = categoryOrder.get(String(b.category_id)) ?? Number.MAX_SAFE_INTEGER;
            if (catOrderA !== catOrderB) return catOrderA - catOrderB;

            const ordA = Number(a.order_number || 0);
            const ordB = Number(b.order_number || 0);
            if (ordA !== ordB) return ordA - ordB;

            return Number(a.id || 0) - Number(b.id || 0);
        });

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const data = uniqueItems.slice(start, end);
        const allpage = Math.max(1, Math.ceil(uniqueItems.length / pageSize));

        return { data, allpage };
    } catch (error) {
        throw error;
    }
};

export const getAudio = async (page) => {
    try {
        const count = await db.table("audioList").count();
        const allpage = Math.ceil(count / pageSize);
        const data = await db
            .table("audioList")
            .orderBy("id")
            .reverse()
            .offset((page - 1) * pageSize)
            .limit(pageSize)
            .toArray();
        return { data, allpage };
    } catch (error) {
        throw error;
    }
};

export const deleteAudio = async () => {
    return db.table("audioList").clear();
};

export const getAudioCount = async () => {
    return db.table("audioList").count();
};

const recursivSearchById = (categories, id) => {
    let category = undefined;

    for (let i = 0; i < categories.length; i++) {
        if (String(categories[i].id) === String(id)) {
            return (category = categories[i]);
        } else if (categories[i].subCategories) {
            const _category = recursivSearchById(categories[i].subCategories, id);
            if (_category) return _category;
        }
    }
    if (category) {
        return category;
    }
};

const recursivSearchByName = (categories, searchText) => {
    const regex = buildSearchRegex(searchText);
    if (!regex) return [];

    let filtered = categories.filter(item => regex.test(item.name)).map(item => ({
        ...item,
        highlightName: item.name
    }));

    categories.forEach((category) => {
        if (category.subCategories) {
            filtered = filtered.concat(recursivSearchByName(category.subCategories, searchText));
        }
    });

    return filtered;
};

export const recursiveSearchByExactName = (categories, searchText) => {
    const normalizedTarget = normalizeCategoryName(searchText)?.toLowerCase();
    let filtered = categories.filter(item => normalizeCategoryName(item.name)?.toLowerCase() === normalizedTarget)

    categories.forEach((category) => {
        if (category.subCategories) {
            filtered = filtered.concat(recursiveSearchByExactName(category.subCategories, searchText));
        }
    });

    return filtered;
};

export const getCategoryById = (id) => {
    return recursivSearchById(categories, id);
};

export const getCategoryByName = (searchText, page) => {
    const filtered = recursivSearchByName(categories, searchText);

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = filtered.slice(start, end);
    const allpage = Math.ceil(filtered.length / pageSize);

    return { data, allpage };
};

export const getCategoryByExactName = (searchText) => {
    return recursiveSearchByExactName(categories, searchText)[0];
};

const safeDecodeURIComponent = (val) => {
    if (val == null) return val;
    const str = String(val);
    try {
        return decodeURIComponent(str);
    } catch (_) {
        return str;
    }
};

export const getCategoryPathByNames = (name, subCategoryNames = []) => {
    if (!name) return [];
    const decodedName = safeDecodeURIComponent(name);
    const normRootTarget = normalizeCategoryName(decodedName)?.toLowerCase();

    // 1. Prefer matching top-level root categories first (exact normalized name or ID)
    let rootCategory = categories.find(
        (item) =>
            normalizeCategoryName(item?.name)?.toLowerCase() === normRootTarget ||
            String(item?.id) === String(decodedName).trim()
    );

    // 2. Fallback to exact name across tree or fuzzy root match
    if (!rootCategory) {
        rootCategory =
            getCategoryByExactName(decodedName) ||
            getCategoryByExactName(String(decodedName).replace(/-/g, " ")) ||
            findSubCategoryByName(categories, decodedName);
    }

    if (!rootCategory) return [];

    const chain = [];
    if (rootCategory.parentId && String(rootCategory.parentId) !== "0") {
        const ancestorIds = [];
        getSubCategoryIds(rootCategory.id, ancestorIds);
        const ancestors = getCategoriesByIds(ancestorIds).reverse();
        if (ancestors.length > 0) {
            chain.push(...ancestors);
        } else {
            chain.push(rootCategory);
        }
    } else {
        chain.push(rootCategory);
    }

    const validSubNames = Array.isArray(subCategoryNames) ? subCategoryNames.filter(Boolean) : [];
    if (validSubNames.length === 0) {
        return chain;
    }

    let currentCategory = chain[chain.length - 1];
    for (const rawSubName of validSubNames) {
        if (!currentCategory?.subCategories?.length) break;
        const found = findSubCategoryByName(currentCategory.subCategories, rawSubName);
        if (found) {
            chain.push(found);
            currentCategory = found;
        } else {
            break;
        }
    }

    return chain;
};

export const getCategoryByNameAndSubCategoryNames = (name, subCategoryNames = []) => {
    const chain = getCategoryPathByNames(name, subCategoryNames);
    return chain.length > 0 ? chain[chain.length - 1] : undefined;
};

const findSubCategoryByName = (siblings, targetName) => {
    if (!siblings || !siblings.length || !targetName) return undefined;
    const decodedTarget = safeDecodeURIComponent(targetName);
    const normTarget = normalizeCategoryName(decodedTarget)?.toLowerCase();

    const exactMatches = siblings.filter((item) => normalizeCategoryName(item?.name)?.toLowerCase() === normTarget);
    if (exactMatches.length === 1) return exactMatches[0];
    if (exactMatches.length > 1) {
        const withSubs = exactMatches.find((item) => item?.subCategories?.length > 0);
        if (withSubs) return withSubs;
        return exactMatches.slice().sort((a, b) => Number(a.id) - Number(b.id))[0];
    }

    const byId = siblings.find((item) => String(item?.id) === String(decodedTarget).trim());
    if (byId) return byId;

    try {
        const results = fuzzysort.go(normTarget, siblings, { key: 'name', allowTypo: true });
        if (results && results.length > 0) {
            return results[0].obj;
        }
    } catch (_) {
    }
    
    return undefined;
};

const normalizeCategoryName = (categoryName) => {
    if (categoryName == null) return categoryName;
    return categoryName
        .toString()
        .normalize()
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001F\u007F\u200B]/g, '')
        .replace(/\u00A0/g, ' ')
        .replace(/[\s_-]+/g, ' ')
        .replace(/\b0+(\d+[a-zA-Z]*)\b/g, '$1')
        .trim();
};

export const getSubCategoryIds = (categoryId, subCategoryIds = [], visited = new Set()) => {
    if (!Array.isArray(subCategoryIds)) {
        subCategoryIds = [];
    }

    const strId = String(categoryId);
    if (visited.has(strId)) {
        return { category: null, subCategoryIds };
    }
    visited.add(strId);

    const category = getCategoryById(categoryId);

    if (!category) {
        return { category: null, subCategoryIds };
    }

    subCategoryIds.push(category.id);

    const parentId = category.parentId !== undefined && category.parentId !== null ? String(category.parentId) : '0';

    if (parentId && parentId !== '0' && parentId !== strId && !visited.has(parentId)) {
        return getSubCategoryIds(parentId, subCategoryIds, visited);
    }

    return { category, subCategoryIds };
};

const getCategoriesByIds = (subCategoryIds) => {
    const categories = [];
    subCategoryIds.forEach((id) => {
        const cat = getCategoryById(id);
        if (cat) categories.push(cat);
    });
    return categories;
};

export const getSubCategoryNamesByIds = (subCategoryIds) => {
    const categories = getCategoriesByIds(subCategoryIds);
    return categories.filter(Boolean).map(category => category.name).reverse();
};

export const getRootCategory = (categoryId) => {
    let category = getCategoryById(categoryId);

    if (!category) return null;

    const visited = new Set();
    while (category && category.parentId && String(category.parentId) !== '0') {
        const pId = String(category.parentId);
        if (visited.has(pId)) break;
        visited.add(pId);

        const parent = getCategoryById(category.parentId);
        if (!parent) break;
        category = parent;
    }

    return category;
};
