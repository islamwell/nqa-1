import { getSubCategoryIds, getSubCategoryNamesByIds } from "../db/services";
import { slugify } from "../utils";

export const navigateToCategory = (categoryId, history) => {
    if (!categoryId) {
        history.push('/');
        return;
    }
    const subCategoryIds = [];
    getSubCategoryIds(categoryId, subCategoryIds);
    const subCategoryNames = getSubCategoryNamesByIds(subCategoryIds);
    const subCategoryQueryParams = subCategoryNames
        .filter(Boolean)
        .map((name) => slugify(name))
        .join('/');

    if (subCategoryQueryParams) {
        history.push(`/category/${subCategoryQueryParams}`);
    } else {
        history.push('/');
    }
};