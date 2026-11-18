import downloadReducer, {
    downalodSlice,
    updateOfflineStatus,
    addToDowanloadingQueue,
    updateDownloadProgress,
    removeFromDownloadingQueue,
    clearDownloadingQueue,
} from "./downloadSlice";

describe("downloadSlice reducer", () => {
    it("should have slice name 'download' to avoid slice collision with player", () => {
        expect(downalodSlice.name).toBe("download");
    });

    const initialState = {
        audioListDownloadProgress: 0,
        audioListDownaloding: false,
        downloadingQueue: [],
        cachelist: [],
        downloadingIds: [],
        offlineMode: false,
    };

    it("should handle updateOfflineStatus", () => {
        const state = downloadReducer(initialState, updateOfflineStatus(true));
        expect(state.offlineMode).toBe(true);
    });

    it("should handle addToDowanloadingQueue safely", () => {
        const item = { id: "audio_1", name: "Surah 1", link: "http://example.com/1.mp3" };
        const state = downloadReducer(initialState, addToDowanloadingQueue(item));
        expect(state.downloadingQueue).toHaveLength(1);
        expect(state.downloadingQueue[0].id).toBe("audio_1");
        expect(state.downloadingIds).toContain("audio_1");
        expect(state.cachelist).toHaveLength(1);
    });

    it("should handle updateDownloadProgress with valid and NaN values without crashing", () => {
        const item = { id: "audio_1", name: "Surah 1", progress: 0 };
        let state = downloadReducer(initialState, addToDowanloadingQueue(item));

        // Normal progress update
        state = downloadReducer(state, updateDownloadProgress({ id: "audio_1", progress: 50 }));
        expect(state.downloadingQueue[0].progress).toBe(50);

        // NaN progress safeguarding
        state = downloadReducer(state, updateDownloadProgress({ id: "audio_1", progress: NaN }));
        expect(state.downloadingQueue[0].progress).toBe(0);

        // Unknown id should not throw
        expect(() => {
            downloadReducer(state, updateDownloadProgress({ id: "non_existent", progress: 20 }));
        }).not.toThrow();
    });

    it("should handle removeFromDownloadingQueue using string-safe ID comparisons", () => {
        const item1 = { id: 101, name: "Surah 1" };
        const item2 = { id: "102", name: "Surah 2" };
        let state = downloadReducer(initialState, addToDowanloadingQueue(item1));
        state = downloadReducer(state, addToDowanloadingQueue(item2));

        expect(state.downloadingQueue).toHaveLength(2);

        // Remove numeric ID with string parameter
        state = downloadReducer(state, removeFromDownloadingQueue({ id: "101" }));
        expect(state.downloadingQueue).toHaveLength(1);
        expect(state.downloadingQueue[0].id).toBe("102");
        expect(state.downloadingIds).not.toContain(101);
    });

    it("should clear downloading queue", () => {
        const item = { id: "1", name: "Surah 1" };
        let state = downloadReducer(initialState, addToDowanloadingQueue(item));
        state = downloadReducer(state, clearDownloadingQueue());
        expect(state.downloadingQueue).toHaveLength(0);
        expect(state.downloadingIds).toHaveLength(0);
    });
});
