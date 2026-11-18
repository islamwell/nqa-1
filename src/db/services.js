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

export const getAudioByCategory = async (categoryId, page = 1) => {
    try {
        const strId = String(categoryId);
        const numId = Number(categoryId);

        let items = [];
        try {
            items = await db
                .table("audioList")
                .where("category_id")
                .equals(numId)
                .or("category_id")
                .equals(strId)
                .toArray();
        } catch (_) {
            const allItems = await db.table("audioList").limit(5000).toArray();
            items = allItems.filter((item) => String(item.category_id) === strId);
        }

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const data = items.slice(start, end);
        const allpage = Math.max(1, Math.ceil(items.length / pageSize));

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

export const getCategoryByNameAndSubCategoryNames = (name, subCategoryNames = []) => {
    if (!name) return undefined;
    const category = getCategoryByExactName(name);
    if (!category) return undefined;

    if (!Array.isArray(subCategoryNames) || subCategoryNames.length === 0) {
        return category;
    }

    let currentCategory = category;
    for (const subName of subCategoryNames) {
        if (!subName || !currentCategory?.subCategories?.length) break;
        const found = findSubCategoryByName(currentCategory.subCategories, subName);
        if (found) {
            currentCategory = found;
        } else {
            break;
        }
    }

    return currentCategory;
};

const findSubCategoryByName = (siblings, targetName) => {
    if (!siblings || !siblings.length || !targetName) return undefined;
    const normTarget = normalizeCategoryName(targetName)?.toLowerCase();

    const exact = siblings.find((item) => normalizeCategoryName(item?.name)?.toLowerCase() === normTarget);
    if (exact) return exact;

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
        .replace(/\u00A0/g, ' ')
        .replace(/[\s_-]+/g, ' ')
        .replace(/\b0+(\d+)\b/g, '$1')
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
