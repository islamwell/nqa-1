import db from "./db";
import categories from "../data/category-strcture";
import fuzzysort from "fuzzysort";
import { audioIndex, categoryIndex } from "../services/algolia";

const synonymGroups = [
    ["quran", "koran"],
    ["hadith", "hadis", "hadees"],
    ["azan", "adhan", "athan"],
    ["ramadan", "ramzan", "ramadhan"],
    ["namaz", "salah", "salat"],
];

const buildSearchRegex = (searchText) => {
    if (!searchText) return null;
    if (searchText.startsWith('"')) {
        const cleaned = searchText.replace(/"/g, "");
        return new RegExp(cleaned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }
    const words = searchText.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return null;

    const regexParts = words.map(word => {
        let variants = [word];
        for (const group of synonymGroups) {
            if (group.includes(word)) {
                variants = group;
                break;
            }
        }
        return `(?=.*\\b(?:${variants.join('|')}))`;
    });
    return new RegExp(`^${regexParts.join('')}.*`, 'i');
};

const pageSize = 10;

export const addAudio = async (data) => {
    return db.table("audioList").bulkPut(data);
};

export const getAudioByName = async (searchText, page) => {
    const HARD_LIMIT = 10000;
    
    // Try Algolia first if online
    if (navigator.onLine) {
        try {
            const res = await audioIndex.search(searchText, {
                page: page - 1,
                hitsPerPage: pageSize
            });
            const mapped = res.hits.map(hit => ({
                ...hit,
                highlightName: hit._highlightResult?.name?.value || hit.name
            }));
            return { data: mapped, allpage: res.nbPages || 1 };
        } catch (error) {
            console.error("Algolia audio search failed, falling back to local DB", error);
        }
    }

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

export const getAudioByCategory = async (categoryId, page) => {
    const HARD_LIMIT = 10000;
    // https://github.com/dfahlander/Dexie.js/issues/838
    try {
        const allItems = await db.table("audioList").limit(HARD_LIMIT).toArray();
        let filtered = allItems.filter((item) => {
            return String(item.category_id) === String(categoryId);
        });
        if (allItems.length === HARD_LIMIT) {
            // We didn't get all data in first try.
            // Need to continue filtering one by one:
            const rest = await db
                .table("audioList")
                .offset(HARD_LIMIT)
                .filter((item) => String(item.category_id) === String(categoryId))
                .toArray();
            filtered = filtered.concat(rest);
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

export const getCategoryByName = async (searchText, page) => {
    // Try Algolia first if online
    if (navigator.onLine) {
        try {
            const res = await categoryIndex.search(searchText, {
                page: page - 1,
                hitsPerPage: pageSize
            });
            const mapped = res.hits.map(hit => ({
                ...hit,
                highlightName: hit._highlightResult?.name?.value || hit.name
            }));
            return { data: mapped, allpage: res.nbPages || 1 };
        } catch (error) {
            console.error("Algolia category search failed, falling back to local search", error);
        }
    }

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

export const getCategoryByNameAndSubCategoryNames = (name, subCategoryNames) => {
    const [subCategoryOneName, subCategoryTwoName, subCategoryThreeName] = subCategoryNames;
    const category = getCategoryByExactName(name);

    if (!category?.subCategories?.length) {
        return category;
    }

    const subCategoryOne = findSubCategoryByName(category?.subCategories, subCategoryOneName);

    if (!subCategoryOne?.subCategories?.length) {
        if (subCategoryOne) {
            return subCategoryOne;
        }

        return category;
    }

    const subCategoryTwo = findSubCategoryByName(subCategoryOne?.subCategories, subCategoryTwoName);

    if (!subCategoryTwo?.subCategories?.length) {
        if (subCategoryTwo) {
            return subCategoryTwo;
        }

        return subCategoryOne;
    }

    const subCategoryThree = findSubCategoryByName(subCategoryTwo?.subCategories, subCategoryThreeName);

    if (!subCategoryThree?.subCategories?.length) {
        if (subCategoryThree) {
            return subCategoryThree;
        }

        return subCategoryTwo;
    }
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

export const getSubCategoryIds = (categoryId, subCategoryIds) => {
    if (!Array.isArray(subCategoryIds)) {
        subCategoryIds = [];
    }

    const category = getCategoryById(categoryId);

    if (!category) {
        return { category: null, subCategoryIds };
    }

    subCategoryIds.push(category.id);

    const parentId = category.parentId !== undefined && category.parentId !== null ? String(category.parentId) : '0';

    if (parentId && parentId !== '0') {
        return getSubCategoryIds(parentId, subCategoryIds);
    }

    return { category, subCategoryIds };
};

const getCategoriesByIds = (subCategoryIds) => {
    const categories = [];
    subCategoryIds.forEach((id) => {
        categories.push(getCategoryById(id));
    });
    return categories;
};

export const getSubCategoryNamesByIds = (subCategoryIds) => {
    const categories = getCategoriesByIds(subCategoryIds);
    return categories.map(category => category.name).reverse();
}

export const getRootCategory = (categoryId) => {
    let category = getCategoryById(categoryId);

    if (!category) return null;

    while (category && category.parentId && String(category.parentId) !== '0') {
        const parent = getCategoryById(category.parentId);
        if (!parent) break;
        category = parent;
    }

    return category;
}
