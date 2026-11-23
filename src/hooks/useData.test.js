import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import axios from "axios";
import playerReducer from "../store/slices/playerSlice";
import downloadReducer from "../store/slices/downloadSlice";
import favoriteReducer from "../store/slices/favoriteSlice";
import * as offlineAPI from "../db/services";
import { useData } from "./useData";

jest.mock("axios");

const createTestStore = () =>
    configureStore({
        reducer: {
            player: playerReducer,
            download: downloadReducer,
            favorite: favoriteReducer,
        },
    });

function HookHarness({ offlineMode, categoryId, shouldSearch = true, append = true, onState }) {
    const state = useData({ offlineMode, categoryId, shouldSearch, append });
    React.useEffect(() => {
        onState(state);
    }, [state, onState]);
    return (
        <div>
            <span data-testid="count">{state.audioList.length}</span>
            <span data-testid="pages">{state.totalPages}</span>
            <span data-testid="current-page">{state.currentPage}</span>
            <button data-testid="next-page" onClick={() => state.changePage(state.currentPage + 1)}>
                Next
            </button>
        </div>
    );
}

describe("useData parent category & offline fallback", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("loads all 31 child Surah categories for Tafseer Juzz 30 (620) online and paginates from cache", async () => {
        axios.get.mockImplementation((url) => {
            const match = url.match(/categoryId=(\d+)/);
            const cid = match ? Number(match[1]) : 0;
            if (cid === 620) {
                return Promise.resolve({ data: { data: [], allpage: 1 } });
            }
            // Return 1 item per Surah (621..651) -> 31 items total across all 31 Surahs
            return Promise.resolve({
                data: {
                    data: [{ id: 1000 + cid, name: `Surah ${cid}`, category_id: cid }],
                    allpage: 1,
                },
            });
        });

        const states = [];
        const store = createTestStore();

        render(
            <Provider store={store}>
                <HookHarness offlineMode={false} categoryId={620} onState={(s) => states.push(s)} />
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("count").textContent).toBe("10");
        });
        expect(screen.getByTestId("pages").textContent).toBe("4"); // 31 items -> 4 pages
        // 1 parent (620) + all 31 child categories (621..651)
        const requestedIds = axios.get.mock.calls.map(([u]) => Number(u.match(/categoryId=(\d+)/)[1]));
        expect(requestedIds).toContain(621);
        expect(requestedIds).toContain(651);
        const callCountAfterPage1 = axios.get.mock.calls.length;

        // Scroll to page 2: should paginate from cache with zero additional network requests
        await act(async () => {
            screen.getByTestId("next-page").click();
        });

        await waitFor(() => {
            expect(screen.getByTestId("count").textContent).toBe("20");
        });
        expect(axios.get).toHaveBeenCalledTimes(callCountAfterPage1);
    });

    it("falls back to online child fetch when offline DB returns empty on page 1", async () => {
        const offlineSpy = jest.spyOn(offlineAPI, "getAudioByCategory").mockResolvedValue({
            data: [],
            allpage: 1,
        });

        axios.get.mockImplementation((url) => {
            const match = url.match(/categoryId=(\d+)/);
            const cid = match ? Number(match[1]) : 0;
            if (cid === 620) return Promise.resolve({ data: { data: [], allpage: 1 } });
            if (cid === 621) {
                return Promise.resolve({
                    data: { data: [{ id: 3085, name: "AnNaba 1", category_id: 621 }], allpage: 1 },
                });
            }
            return Promise.resolve({ data: { data: [], allpage: 1 } });
        });

        const store = createTestStore();
        render(
            <Provider store={store}>
                <HookHarness offlineMode={true} categoryId={620} onState={() => {}} />
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("count").textContent).toBe("1");
        });
        expect(offlineSpy).toHaveBeenCalledWith(620, 1);
        offlineSpy.mockRestore();
    });

    it("retains lectures cleanly when offlineMode switches false -> true and resets page cleanly on category change", async () => {
        const offlineSpy = jest.spyOn(offlineAPI, "getAudioByCategory").mockResolvedValue({
            data: [
                { id: 3085, name: "AnNaba A", category_id: 621 },
                { id: 3122, name: "Lahab", category_id: 651 },
            ],
            allpage: 1,
        });

        axios.get.mockImplementation((url) => {
            if (url.includes("categoryId=620")) return Promise.resolve({ data: { data: [], allpage: 1 } });
            if (url.includes("categoryId=621")) {
                return Promise.resolve({
                    data: { data: [{ id: 3085, name: "AnNaba A", category_id: 621 }], allpage: 1 },
                });
            }
            if (url.includes("categoryId=688")) {
                return Promise.resolve({
                    data: { data: [{ id: 9001, name: "Juzz 29", category_id: 688 }], allpage: 3 },
                });
            }
            return Promise.resolve({ data: { data: [], allpage: 1 } });
        });

        const store = createTestStore();
        const { rerender } = render(
            <Provider store={store}>
                <HookHarness offlineMode={false} categoryId={620} onState={() => {}} />
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("count").textContent).toBe("1");
        });

        // Simulate downloadAudioList completing -> offlineMode flips to true
        rerender(
            <Provider store={store}>
                <HookHarness offlineMode={true} categoryId={620} onState={() => {}} />
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("count").textContent).toBe("2");
        });

        // Simulate scrolling to page 2 while on category 688, then navigating back to 620
        rerender(
            <Provider store={store}>
                <HookHarness offlineMode={false} categoryId={688} onState={() => {}} />
            </Provider>
        );
        await act(async () => {
            screen.getByTestId("next-page").click();
        });
        await waitFor(() => {
            expect(screen.getByTestId("current-page").textContent).toBe("2");
        });

        axios.get.mockClear();
        rerender(
            <Provider store={store}>
                <HookHarness offlineMode={false} categoryId={620} onState={() => {}} />
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("current-page").textContent).toBe("1");
        });
        // Should NOT fire a bogus page=2 fetch for category 620
        const bogusPage2Calls = axios.get.mock.calls.filter(([u]) => u.includes("categoryId=620") && u.includes("page=2"));
        expect(bogusPage2Calls).toHaveLength(0);

        offlineSpy.mockRestore();
    });
});
