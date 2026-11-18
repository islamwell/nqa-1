import playerReducer, {
    play,
    toggle,
    minimize,
    maximize,
    closePlayer,
    updateCurrentAudioList,
    playNextOrPrevious,
    changeURL,
} from "./playerSlice";

describe("playerSlice reducer", () => {
    const initialState = {
        open: false,
        minimized: false,
        playing: false,
        link: "",
        id: -1,
        name: "",
        categoryId: null,
        recentlyPlayed: [],
        topChart: [],
        currentAudioList: [],
        currentPlayingPosition: "home",
    };

    it("should return the initial state", () => {
        expect(playerReducer(undefined, { type: undefined })).toEqual(initialState);
    });

    it("should handle play, toggle, minimize, maximize, and closePlayer", () => {
        let state = playerReducer(initialState, play());
        expect(state.open).toBe(true);
        expect(state.minimized).toBe(false);

        state = playerReducer(state, toggle(true));
        expect(state.playing).toBe(true);

        state = playerReducer(state, minimize());
        expect(state.minimized).toBe(true);

        state = playerReducer(state, maximize());
        expect(state.minimized).toBe(false);

        state = playerReducer(state, closePlayer());
        expect(state.open).toBe(false);
        expect(state.link).toBeNull();
        expect(state.id).toBe(-1);
        expect(state.playing).toBe(false);
    });

    describe("playNextOrPrevious", () => {
        const audioList = [
            { id: "1", name: "Surah 1", link: "http://example.com/1.mp3", categoryId: 10 },
            { id: "2", name: "Surah 2", link: "http://example.com/2.mp3", categoryId: 10 },
            { id: "3", name: "Surah 3", link: "http://example.com/3.mp3", categoryId: 10 },
        ];

        it("should advance to next track safely", () => {
            const stateWithList = {
                ...initialState,
                id: "1",
                currentAudioList: audioList,
                currentPlayingPosition: "home",
            };

            const nextState = playerReducer(stateWithList, playNextOrPrevious("next"));
            expect(nextState.id).toBe("2");
            expect(nextState.name).toBe("Surah 2");
        });

        it("should wrap around to the first track when next is called on the last track", () => {
            const stateWithList = {
                ...initialState,
                id: "3",
                currentAudioList: audioList,
                currentPlayingPosition: "home",
            };

            const nextState = playerReducer(stateWithList, playNextOrPrevious("next"));
            expect(nextState.id).toBe("1");
            expect(nextState.name).toBe("Surah 1");
        });

        it("should wrap around to the last track when previous is called on the first track", () => {
            const stateWithList = {
                ...initialState,
                id: "1",
                currentAudioList: audioList,
                currentPlayingPosition: "home",
            };

            const nextState = playerReducer(stateWithList, playNextOrPrevious("previous"));
            expect(nextState.id).toBe("3");
            expect(nextState.name).toBe("Surah 3");
        });

        it("should not throw or modify state when audio list is empty", () => {
            const emptyState = {
                ...initialState,
                id: "1",
                currentAudioList: [],
            };

            const nextState = playerReducer(emptyState, playNextOrPrevious("next"));
            expect(nextState.id).toBe("1");
        });

        it("should correctly navigate within recentlyPlayed when position is recentlyPlayed", () => {
            const recentList = [
                { id: "101", name: "Recent 1", link: "http://example.com/r1.mp3" },
                { id: "102", name: "Recent 2", link: "http://example.com/r2.mp3" },
            ];

            const stateWithRecent = {
                ...initialState,
                id: "101",
                recentlyPlayed: recentList,
                currentPlayingPosition: "recentlyPlayed",
            };

            const nextState = playerReducer(stateWithRecent, playNextOrPrevious("next"));
            expect(nextState.id).toBe("102");
            expect(nextState.name).toBe("Recent 2");
        });
    });

    describe("changeURL", () => {
        it("should set current playing track and update recentlyPlayed", () => {
            const payload = {
                id: "5",
                name: "Ayah 5",
                link: "http://example.com/5.mp3",
                categoryId: 20,
                image: "http://example.com/img.jpg",
                currentPlayingPosition: "category",
            };

            const state = playerReducer(initialState, changeURL(payload));
            expect(state.id).toBe("5");
            expect(state.name).toBe("Ayah 5");
            expect(state.open).toBe(true);
            expect(state.minimized).toBe(false);
            expect(state.recentlyPlayed).toHaveLength(1);
            expect(state.recentlyPlayed[0].id).toBe("5");
        });

        it("should deduplicate existing items in recentlyPlayed and place the new one at the end", () => {
            const existingRecent = [
                { id: "5", name: "Ayah 5", link: "http://example.com/5.mp3" },
                { id: "6", name: "Ayah 6", link: "http://example.com/6.mp3" },
            ];

            const stateWithRecent = {
                ...initialState,
                recentlyPlayed: existingRecent,
            };

            const payload = {
                id: "5",
                name: "Ayah 5 Updated",
                link: "http://example.com/5.mp3",
                categoryId: 20,
                currentPlayingPosition: "home",
            };

            const state = playerReducer(stateWithRecent, changeURL(payload));
            expect(state.recentlyPlayed).toHaveLength(2);
            expect(state.recentlyPlayed[0].id).toBe("6");
            expect(state.recentlyPlayed[1].id).toBe("5");
        });

        it("should cap recentlyPlayed list to 40 items", () => {
            const longList = Array.from({ length: 40 }, (_, i) => ({
                id: String(i),
                name: `Track ${i}`,
                link: `http://example.com/${i}.mp3`,
            }));

            const stateWithLongList = {
                ...initialState,
                recentlyPlayed: longList,
            };

            const newPayload = {
                id: "999",
                name: "Track 999",
                link: "http://example.com/999.mp3",
                currentPlayingPosition: "home",
            };

            const state = playerReducer(stateWithLongList, changeURL(newPayload));
            expect(state.recentlyPlayed.length).toBeLessThanOrEqual(40);
            expect(state.recentlyPlayed[state.recentlyPlayed.length - 1].id).toBe("999");
        });
    });
});
