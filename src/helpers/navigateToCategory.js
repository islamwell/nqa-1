import { getSubCategoryIds, getSubCategoryNamesByIds } from "../db/services";
import { slugify } from "../utils";

export const navigateToCategory = (categoryId, history) => {
    const subCategoryIds = [];
    getSubCategoryIds(categoryId, subCategoryIds);
    const subCategoryNames = getSubCategoryNamesByIds(subCategoryIds);
    const subCategoryQueryParams = subCategoryNames.map((name) => slugify(name)).join('/');

    history.push(`/category/${subCategoryQueryParams}`);
};