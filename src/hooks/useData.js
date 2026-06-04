/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from "axios";
import * as offlineAPI from "../db/services";
import { useDispatch } from "react-redux";
import { updateCurrentAudioList } from "../store/slices/playerSlice";
import { domain } from "../data/config";
import { getCategoryById } from "../db/services";

// Collect all leaf (countSub === 0) category IDs under a parent
const collectLeafCategoryIds = (category) => {
    const ids = [];
    if (!category) return ids;
    if (!category.subCategories || category.subCategories.length === 0) {
        ids.push(category.id);
    } else {
        for (const sub of category.subCategories) {
            ids.push(...collectLeafCategoryIds(sub));
        }
    }
    return ids;
};

export const useData = (props = {}) => {
    const dispatch = useDispatch();

    const { offlineMode = false, searchText = undefined, categoryId = undefined, shouldSearch = true } = props;
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [audioList, setAudioList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [categorySearchCurrentPage, setCategorySearchCurrentPage] = useState(1);
    const [categorySearchTotalPages, setCategorySearchTotalPages] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
        setCategorySearchCurrentPage(1);
    }, [searchText, categoryId]);

    // Fetch MP3s from multiple child categories and merge them
    const fetchFromChildCategories = async (parentCategoryId) => {
        const parent = getCategoryById(parentCategoryId);
        if (!parent || !parent.subCategories || parent.subCategories.length === 0) {
            return null; // Not a parent category
        }
        const leafIds = collectLeafCategoryIds(parent);
        if (leafIds.length === 0) return null;

        const allResults = [];
        // Fetch page 1 from every leaf child
        const promises = leafIds.map((id) =>
            axios
                .get(`${domain}/index.php/api/songCategory?page=1&categoryId=${id}`)
                .then((res) => res?.data?.data || [])
                .catch(() => [])
        );
        const results = await Promise.all(promises);
        for (const list of results) {
            allResults.push(...list);
        }

        if (allResults.length === 0) return null;

        // Client-side pagination
        const pageSize = 10;
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return {
            data: allResults.slice(start, end),
            allpage: Math.ceil(allResults.length / pageSize),
        };
    };

    const getAudioListOnline = async () => {
        if (!shouldSearch) {
            return;
        }

        setLoading(true);

        let link = `${domain}/index.php/api/songView?page=${currentPage}`;

        if (searchText) {
            link = `${domain}/index.php/api/nameSong?song=${searchText}&page=${currentPage}`;
        }

        if (categoryId) {
            link = `${domain}/index.php/api/songCategory?page=${currentPage}&categoryId=${categoryId}`;
        }

        axios
            .get(link)
            .then(async (res) => {
                const list = res?.data?.data || [];
                const pages = res?.data?.allpage || 1;

                if (Array.isArray(list) && list.length === 0 && categoryId) {
                    // Try fetching from child subcategories first
                    try {
                        const childResult = await fetchFromChildCategories(categoryId);
                        if (childResult && childResult.data.length > 0) {
                            setAudioList(prev => currentPage === 1 ? childResult.data : [...prev, ...childResult.data]);
                            setTotalPages(childResult.allpage || 1);
                            setLoading(false);
                            return;
                        }
                    } catch (_) {}

                    try {
                        const offline = await offlineAPI.getAudioByCategory(categoryId, currentPage);
                        setAudioList(prev => currentPage === 1 ? offline.data : [...prev, ...offline.data]);
                        setTotalPages(offline.allpage || 1);
                    } catch (_) {
                        setAudioList(prev => currentPage === 1 ? list : [...prev, ...list]);
                        setTotalPages(pages);
                    } finally {
                        setLoading(false);
                    }
                } else {
                    setAudioList(prev => currentPage === 1 ? list : [...prev, ...list]);
                    setTotalPages(pages);
                    setLoading(false);
                }
            })
            .catch(async (e) => {
                try {
                    if (searchText) {
                        const res = await offlineAPI.getAudioByName(searchText, currentPage);
                        setAudioList(prev => currentPage === 1 ? res.data : [...prev, ...res.data]);
                        setTotalPages(res.allpage || 1);
                    } else if (categoryId) {
                        // Try child categories first
                        try {
                            const childResult = await fetchFromChildCategories(categoryId);
                            if (childResult && childResult.data.length > 0) {
                                setAudioList(prev => currentPage === 1 ? childResult.data : [...prev, ...childResult.data]);
                                setTotalPages(childResult.allpage || 1);
                                setLoading(false);
                                return;
                            }
                        } catch (_) {}
                        const res = await offlineAPI.getAudioByCategory(categoryId, currentPage);
                        setAudioList(prev => currentPage === 1 ? res.data : [...prev, ...res.data]);
                        setTotalPages(res.allpage || 1);
                    } else {
                        const res = await offlineAPI.getAudio(currentPage);
                        setAudioList(prev => currentPage === 1 ? res.data : [...prev, ...res.data]);
                        setTotalPages(res.allpage || 1);
                    }
                } catch (_) {}
                setLoading(false);
            });
    };

    const getAudioListOffline = async () => {
        if (!shouldSearch) {
            return;
        }

        try {
            setLoading(true);

            if (searchText) {
                const res = await offlineAPI.getAudioByName(searchText, currentPage);
                setAudioList(prev => currentPage === 1 ? res.data : [...prev, ...res.data]);
                setTotalPages(res.allpage);
            } else if (categoryId) {
                const res = await offlineAPI.getAudioByCategory(categoryId, currentPage);
                setAudioList(prev => currentPage === 1 ? res.data : [...prev, ...res.data]);
                setTotalPages(res.allpage);
            } else {
                const res = await offlineAPI.getAudio(currentPage);
                setAudioList(prev => currentPage === 1 ? res.data : [...prev, ...res.data]);
                setTotalPages(res.allpage);
            }

            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    const changePage = (page) => {
        setCurrentPage(page);
    };

    const changeCategorySearchPage = (page) => {
        setCategorySearchCurrentPage(page);
    };

    useEffect(() => {
        if (!offlineMode) {
            getAudioListOnline();
        } else {
            getAudioListOffline();
        }
    }, [currentPage, searchText, categoryId, offlineMode]);

    useEffect(() => {
        const getCategoryList = async () => {
            const res = offlineAPI.getCategoryByName(searchText, categorySearchCurrentPage);
            setCategoryList(prev => categorySearchCurrentPage === 1 ? res.data : [...prev, ...res.data]);
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
