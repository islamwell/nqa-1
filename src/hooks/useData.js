/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import * as offlineAPI from "../db/services";
import { useDispatch } from "react-redux";
import { updateCurrentAudioList } from "../store/slices/playerSlice";
import { domain } from "../data/config";
import { getCategoryById } from "../db/services";

const PAGE_SIZE = 10;
const MAX_CHILD_LEAF_FETCH = 40;

// Collect all leaf (countSub === 0) category IDs under a parent
const collectLeafCategoryIds = (category, visited = new Set()) => {
    const ids = [];
    if (!category || category.id === undefined || category.id === null) return ids;
    const strId = String(category.id);
    if (visited.has(strId)) return ids;
    visited.add(strId);

    if (!category.subCategories || category.subCategories.length === 0) {
        ids.push(category.id);
    } else {
        for (const sub of category.subCategories) {
            ids.push(...collectLeafCategoryIds(sub, visited));
        }
    }
    return ids;
};

const mergeUniqueById = (prev, incoming) => {
    const list = incoming || [];
    if (!prev || prev.length === 0) return list;
    const seen = new Set(prev.map((item) => String(item.id)));
    const additions = list.filter((item) => !seen.has(String(item.id)));
    return [...prev, ...additions];
};

export const useData = (props = {}) => {
    const dispatch = useDispatch();

    const {
        offlineMode = false,
        searchText = undefined,
        categoryId = undefined,
        shouldSearch = true,
        append = false,
    } = props;
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [audioList, setAudioList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [categorySearchCurrentPage, setCategorySearchCurrentPage] = useState(1);
    const [categorySearchTotalPages, setCategorySearchTotalPages] = useState(1);

    const prevFilterRef = useRef(null);
    const childCacheRef = useRef({ categoryId: null, items: null });

    const updateList = (prev, incoming, pageToUse) => {
        if (!append || pageToUse === 1) {
            return incoming || [];
        }
        return mergeUniqueById(prev, incoming);
    };

    const paginateChildResults = (items, pageToUse) => {
        const start = (pageToUse - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        return {
            data: items.slice(start, end),
            allpage: Math.max(1, Math.ceil(items.length / PAGE_SIZE)),
        };
    };

    // Fetch MP3s from child categories and cache across pagination
    const fetchFromChildCategories = async (parentCategoryId, pageToUse) => {
        const strParentId = String(parentCategoryId);
        if (childCacheRef.current.categoryId === strParentId && Array.isArray(childCacheRef.current.items)) {
            if (childCacheRef.current.items.length === 0) return null;
            return paginateChildResults(childCacheRef.current.items, pageToUse);
        }

        const parent = getCategoryById(parentCategoryId);
        let candidateIds = [];
        if (parent && parent.subCategories && parent.subCategories.length > 0) {
            candidateIds = collectLeafCategoryIds(parent);
        } else {
            const descIds = offlineAPI.getDescendantCategoryIds(parentCategoryId);
            candidateIds = descIds.filter((id) => String(id) !== strParentId);
        }
        const leafIds = candidateIds.slice(0, MAX_CHILD_LEAF_FETCH);
        if (leafIds.length === 0) return null;

        const allResults = [];
        const seenIds = new Set();
        // Fetch page 1 from leaf children in small batches to prevent server flooding
        const batchSize = 5;
        for (let i = 0; i < leafIds.length; i += batchSize) {
            const batch = leafIds.slice(i, i + batchSize);
            const batchPromises = batch.map((id) =>
                axios
                    .get(`${domain}/index.php/api/songCategory?page=1&categoryId=${id}`)
                    .then((res) => res?.data?.data || [])
                    .catch(() => [])
            );
            const batchResults = await Promise.all(batchPromises);
            for (const list of batchResults) {
                if (Array.isArray(list)) {
                    for (const item of list) {
                        if (item && item.id !== undefined && !seenIds.has(String(item.id))) {
                            seenIds.add(String(item.id));
                            allResults.push(item);
                        }
                    }
                }
            }
        }

        if (allResults.length === 0) return null;

        childCacheRef.current = { categoryId: strParentId, items: allResults };
        return paginateChildResults(allResults, pageToUse);
    };

    const getAudioListOnline = async (isMounted = () => true, pageToUse = currentPage) => {
        if (!shouldSearch) {
            return;
        }

        setLoading(true);

        // Reuse cached child category items on scroll without hitting the server again
        if (
            categoryId &&
            childCacheRef.current.categoryId === String(categoryId) &&
            Array.isArray(childCacheRef.current.items) &&
            childCacheRef.current.items.length > 0
        ) {
            const cachedResult = paginateChildResults(childCacheRef.current.items, pageToUse);
            if (isMounted()) {
                setAudioList((prev) => updateList(prev, cachedResult.data, pageToUse));
                setTotalPages(cachedResult.allpage || 1);
                setLoading(false);
            }
            return;
        }

        let link = `${domain}/index.php/api/songView?page=${pageToUse}`;

        if (searchText) {
            link = `${domain}/index.php/api/nameSong?song=${encodeURIComponent(searchText)}&page=${pageToUse}`;
        }

        if (categoryId) {
            link = `${domain}/index.php/api/songCategory?page=${pageToUse}&categoryId=${categoryId}`;
        }

        try {
            const res = await axios.get(link);
            if (!isMounted()) return;
            const list = res?.data?.data || [];
            const pages = res?.data?.allpage || 1;

            if (Array.isArray(list) && list.length === 0 && categoryId) {
                // Parent category has no direct songs; fetch from child subcategories first
                try {
                    const childResult = await fetchFromChildCategories(categoryId, pageToUse);
                    if (!isMounted()) return;
                    if (childResult && childResult.data.length > 0) {
                        setAudioList((prev) => updateList(prev, childResult.data, pageToUse));
                        setTotalPages(childResult.allpage || 1);
                        setLoading(false);
                        return;
                    }
                } catch (_) {}

                // Fallback to offline DB (which also gathers all descendant categories)
                try {
                    const offline = await offlineAPI.getAudioByCategory(categoryId, pageToUse);
                    if (!isMounted()) return;
                    setAudioList((prev) => updateList(prev, offline.data, pageToUse));
                    setTotalPages(offline.allpage || 1);
                } catch (_) {
                    if (!isMounted()) return;
                    setAudioList((prev) => updateList(prev, list, pageToUse));
                    setTotalPages(pages);
                } finally {
                    if (isMounted()) setLoading(false);
                }
            } else {
                setAudioList((prev) => updateList(prev, list, pageToUse));
                setTotalPages(pages);
                setLoading(false);
            }
        } catch (e) {
            if (!isMounted()) return;
            try {
                if (searchText) {
                    const res = await offlineAPI.getAudioByName(searchText, pageToUse);
                    if (!isMounted()) return;
                    setAudioList((prev) => updateList(prev, res.data, pageToUse));
                    setTotalPages(res.allpage || 1);
                } else if (categoryId) {
                    // Check offline descendant DB first when main API call failed
                    const offline = await offlineAPI.getAudioByCategory(categoryId, pageToUse);
                    if (!isMounted()) return;
                    if (offline && offline.data.length > 0) {
                        setAudioList((prev) => updateList(prev, offline.data, pageToUse));
                        setTotalPages(offline.allpage || 1);
                        setLoading(false);
                        return;
                    }
                    // Last resort: try child subcategories in case only parent endpoint failed
                    try {
                        const childResult = await fetchFromChildCategories(categoryId, pageToUse);
                        if (!isMounted()) return;
                        if (childResult && childResult.data.length > 0) {
                            setAudioList((prev) => updateList(prev, childResult.data, pageToUse));
                            setTotalPages(childResult.allpage || 1);
                            setLoading(false);
                            return;
                        }
                    } catch (_) {}
                    setAudioList((prev) => updateList(prev, offline?.data || [], pageToUse));
                    setTotalPages(offline?.allpage || 1);
                } else {
                    const res = await offlineAPI.getAudio(pageToUse);
                    if (!isMounted()) return;
                    setAudioList((prev) => updateList(prev, res.data, pageToUse));
                    setTotalPages(res.allpage || 1);
                }
            } catch (_) {}
            if (isMounted()) setLoading(false);
        }
    };

    const getAudioListOffline = async (isMounted = () => true, pageToUse = currentPage) => {
        if (!shouldSearch) {
            return;
        }

        try {
            setLoading(true);

            let res;
            if (searchText) {
                res = await offlineAPI.getAudioByName(searchText, pageToUse);
            } else if (categoryId) {
                res = await offlineAPI.getAudioByCategory(categoryId, pageToUse);
            } else {
                res = await offlineAPI.getAudio(pageToUse);
            }
            if (!isMounted()) return;

            // If IndexedDB has no records for page 1 (e.g., empty/cleared DB or newer server category),
            // fall back to live API instead of rendering an empty list.
            if ((!res?.data || res.data.length === 0) && pageToUse === 1) {
                await getAudioListOnline(isMounted, pageToUse);
                return;
            }

            setAudioList((prev) => updateList(prev, res.data, pageToUse));
            setTotalPages(res.allpage || 1);
            if (isMounted()) setLoading(false);
        } catch (error) {
            if (isMounted()) setLoading(false);
        }
    };

    const changePage = (page) => {
        setCurrentPage(page);
    };

    const changeCategorySearchPage = (page) => {
        setCategorySearchCurrentPage(page);
    };

    useEffect(() => {
        const filterKey = `${searchText || ""}|${categoryId || ""}`;
        const filterChanged = prevFilterRef.current !== null && prevFilterRef.current !== filterKey;
        prevFilterRef.current = filterKey;

        if (filterChanged) {
            childCacheRef.current = { categoryId: null, items: null };
            setAudioList([]);
            setTotalPages(1);
            setCategorySearchCurrentPage(1);
            if (currentPage !== 1) {
                setCurrentPage(1);
                return;
            }
        }

        if (!shouldSearch) {
            setLoading(false);
            return;
        }

        let mounted = true;
        const isMounted = () => mounted;
        if (!offlineMode) {
            getAudioListOnline(isMounted, currentPage);
        } else {
            getAudioListOffline(isMounted, currentPage);
        }
        return () => {
            mounted = false;
        };
    }, [currentPage, searchText, categoryId, offlineMode, shouldSearch]);

    useEffect(() => {
        const getCategoryList = async () => {
            const res = offlineAPI.getCategoryByName(searchText, categorySearchCurrentPage);
            setCategoryList((prev) => (categorySearchCurrentPage === 1 ? res.data : [...prev, ...res.data]));
            setCategorySearchTotalPages(res.allpage);
        };

        if (searchText) {
            getCategoryList();
        }
    }, [categorySearchCurrentPage, searchText]);

    useEffect(() => {
        dispatch(updateCurrentAudioList(audioList));
    }, [audioList]);

    return {
        changePage,
        changeCategorySearchPage,
        currentPage,
        categorySearchCurrentPage,
        totalPages,
        categorySearchTotalPages,
        audioList,
        categoryList,
        loading,
    };
};
