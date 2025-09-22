import db from "./db";
import categories from "../data/category-strcture";
import fuzzysort from "fuzzysort";

const pageSize = 10;

export const addAudio = async (data) => {
    return db.table("audioList").bulkPut(data);
};

export const getAudioByName = async (searchText, page) => {
    const HARD_LIMIT = 10000;
    // https://github.com/dfahlander/Dexie.js/issues/838
    try {
        const allItems = await db.table("audioList").limit(HARD_LIMIT).toArray();
        let filtered = searchText.startsWith('"')
            ? allItems.filter(item => item.name.toLowerCase().includes(searchText.replace(/"/g, "").toLowerCase()))
            : fuzzysort.go(searchText, allItems, { key: 'name', allowTypo: true }).map(result => ({
                ...result.obj,
                highlightName: fuzzysort.highlight(result, '<b style="background: yellow">', '</b>')
            }));
        if (allItems.length === HARD_LIMIT) {
            // We didn't get all data in first try.
            // Need to continue filtering one by one:
            const rest = await db
                .table("audioList")
                .offset(HARD_LIMIT)
                .toArray();

            const filteredRest = searchText.startsWith('"')
                ? rest.filter(item => item.name.toLowerCase().includes(searchText.replace(/"/g, "").toLowerCase()))
                : fuzzysort.go(searchText, rest, { key: 'name', allowTypo: true }).map(result => ({
                    ...result.obj,
                    highlightName: fuzzysort.highlight(result, '<b style="background: yellow">', '</b>')
                }));

            filtered = filtered.concat(filteredRest);
        }

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const data = filtered.slice(start, end);
        const allpage = Math.round(filtered.length / pageSize);

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
        const allpage = Math.round(filtered.length / pageSize);

        return { data, allpage };
    } catch (error) {
        throw error;
    }
};

export const getAudio = async (page) => {
    try {
        const count = await db.table("audioList").count();
        const allpage = Math.round(count / pageSize);
        const data = await db
            .table("audioList")
            .orderBy("name")
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
    let filtered = searchText.startsWith('"')
        ? categories.filter(item => item.name.toLowerCase().includes(searchText.replace(/"/g, "").toLowerCase()))
        : fuzzysort.go(searchText, categories, { key: 'name', allowTypo: true }).map(result => ({
            ...result.obj,
            highlightName: fuzzysort.highlight(result, '<b style="background: yellow">', '</b>')
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
    const allpage = Math.round(filtered.length / pageSize);

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
