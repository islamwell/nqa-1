import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import * as offlineAPI from "../../db/services";

export const downloadAudio = createAsyncThunk("download/audio", async ({ id, link }, { dispatch, signal }) => {
    const httpsLink = link.replace("http://", "https://");

    try {
        if (typeof window !== "undefined" && "caches" in window) {
            const cache = await caches.open("audio_cache");
            const response = await fetch(httpsLink, { signal });
            if (response.ok || response.status === 200 || response.status === 206) {
                await cache.put(new Request(httpsLink), response.clone());
                if (link !== httpsLink) {
                    await cache.put(new Request(link), response.clone());
                }
                dispatch(downalodSlice.actions.updateDownloadProgress({ id, progress: 100 }));
                return;
            }
        }
    } catch (_) {}

    const source = axios.CancelToken.source();
    signal.addEventListener("abort", () => {
        source.cancel();
    });

    try {
        const response = await axios({
            url: httpsLink,
            method: "get",
            responseType: "blob",
            onDownloadProgress: (progressEvent) => {
                const total = progressEvent.total || progressEvent.loaded;
                let progress = total > 0 ? Math.round((progressEvent.loaded * 100) / total) : 0;
                if (isNaN(progress)) progress = 0;
                dispatch(downalodSlice.actions.updateDownloadProgress({ id, progress }));
            },
            cancelToken: source.token,
        });

        if (typeof window !== "undefined" && "caches" in window && response.data) {
            const cache = await caches.open("audio_cache");
            const resObj = new Response(response.data, {
                headers: { "Content-Type": "audio/mpeg" },
            });
            await cache.put(new Request(httpsLink), resObj.clone());
            if (link !== httpsLink) {
                await cache.put(new Request(link), resObj.clone());
            }
        }
    } catch (error) {}
});

export const downloadAudioList = createAsyncThunk("downalod/audioList", async (_, { dispatch }) => {
    const getAudioListFromAllPages = async () => {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/audio-list.json`);
        if (!response.ok) throw new Error(`Failed to load audio list: ${response.status}`);
        return response.json();
    };

    try {
        dispatch(downalodSlice.actions.updateOfflineStatus(false));

        // Fetch first so a network failure doesn't wipe the existing offline data.
        const res = await getAudioListFromAllPages();
        await offlineAPI.deleteAudio();
        await offlineAPI.addAudio(res);

        dispatch(downalodSlice.actions.updateOfflineStatus(true));
    } catch (error) {}
});

export const downalodSlice = createSlice({
    name: "download",
    initialState: {
        audioListDownloadProgress: 0,
        audioListDownaloding: false,
        downloadingQueue: [],
        cachelist: [],
        downloadingIds: [],
        offlineMode: false,
    },
    reducers: {
        updateOfflineStatus: (state, action) => {
            state.offlineMode = action.payload;
            localStorage.setItem("offline_mode", action.payload);
        },
        addToDowanloadingQueue: (state, action) => {
            state.downloadingQueue.push(action.payload);
            state.downloadingIds.push(action.payload.id);
            state.cachelist.push(action.payload);
        },

        updateDownloadProgress: (state, action) => {
            const downloadItem = state.downloadingQueue.find((item) => String(item.id) === String(action.payload.id));
            if (downloadItem) {
                const prog = Number(action.payload.progress);
                downloadItem.progress = isNaN(prog) ? 0 : Math.max(0, Math.min(100, Math.round(prog)));
            }
        },

        updateAudioListDownloadProgress: (state, action) => {
            const percentage = (action.payload.page * 100) / (action.payload.allpage || 1);
            state.audioListDownloadProgress = Math.round(percentage);
        },
        changeCache: (state, action) => {
            state.cachelist = state.cachelist.filter((item) => String(item.id) !== String(action.payload.id));
        },
        removeFromDownloadingQueue: (state, action) => {
            state.downloadingQueue = state.downloadingQueue.filter((item) => String(item.id) !== String(action.payload.id));
            state.downloadingIds = state.downloadingIds.filter((item) => String(item) !== String(action.payload.id));
        },
        clearDownloadingQueue: (state) => {
            state.downloadingQueue = [];
            state.downloadingIds = [];
        },
    },

    extraReducers: (builder) => {
        builder.addCase(downloadAudio.fulfilled, (state, action) => {
            state.downloadingQueue = state.downloadingQueue.filter((item) => String(item.id) !== String(action.meta?.arg?.id));
            state.downloadingIds = state.downloadingIds.filter((item) => String(item) !== String(action.meta?.arg?.id));
        });

        builder.addCase(downloadAudio.rejected, (state, action) => {
            state.downloadingQueue = state.downloadingQueue.filter((item) => String(item.id) !== String(action.meta?.arg?.id));
            state.downloadingIds = state.downloadingIds.filter((item) => String(item) !== String(action.meta?.arg?.id));
        });

        builder.addCase(downloadAudioList.pending, (state) => {
            state.audioListDownaloding = true;
        });

        builder.addCase(downloadAudioList.rejected, (state) => {
            state.audioListDownaloding = false;
            state.audioListDownloadProgress = 0;
        });

        builder.addCase(downloadAudioList.fulfilled, (state) => {
            state.audioListDownaloding = false;
            state.audioListDownloadProgress = 0;
            state.offlineMode = true;
            localStorage.setItem("offline_mode", true);
        });
    },
});

export const {
    addToDowanloadingQueue,
    updateOfflineStatus,
    changeCache,
    updateDownloadProgress,
    updateAudioListDownloadProgress,
    removeFromDownloadingQueue,
    clearDownloadingQueue,
} = downalodSlice.actions;

export default downalodSlice.reducer;