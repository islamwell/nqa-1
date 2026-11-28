import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import playerReducer from "../../store/slices/playerSlice";
import downloadReducer from "../../store/slices/downloadSlice";
import favoriteReducer from "../../store/slices/favoriteSlice";
import HomeHero from "./HomeHero";

const lecture = (id, name) => ({
    id,
    name,
    link: `https://example.com/${id}.mp3`,
    image: "https://example.com/cover.png",
    categoryId: 613,
});

const renderHero = (preloadedState = {}) => {
    const store = configureStore({
        reducer: { player: playerReducer, download: downloadReducer, favorite: favoriteReducer },
    });
    const base = store.getState();
    const seeded = configureStore({
        reducer: { player: playerReducer, download: downloadReducer, favorite: favoriteReducer },
        preloadedState: {
            ...base,
            player: { ...base.player, ...(preloadedState.player || {}) },
            favorite: { ...base.favorite, ...(preloadedState.favorite || {}) },
        },
    });
    const history = createMemoryHistory({ initialEntries: ["/"] });
    render(
        <Provider store={seeded}>
            <Router history={history}>
                <HomeHero />
            </Router>
        </Provider>
    );
    return { store: seeded, history };
};

describe("HomeHero", () => {
    it("greets the listener and hides Continue when nothing was played", () => {
        renderHero();
        expect(screen.getByText("Assalamu Alaikum")).toBeInTheDocument();
        expect(screen.queryByText(/Continue:/)).not.toBeInTheDocument();
        expect(screen.getByText("Favorites")).toBeInTheDocument();
    });

    it("Continue plays the most recent lecture from history", () => {
        const { store } = renderHero({
            player: { recentlyPlayed: [lecture(1, "First talk"), lecture(2, "Latest talk")] },
        });
        fireEvent.click(screen.getByText(/Continue: Latest talk/));
        const player = store.getState().player;
        expect(player.id).toBe(2);
        expect(player.name).toBe("Latest talk");
        expect(player.currentPlayingPosition).toBe("recentlyPlayed");
    });

    it("shows the favorites count and navigates to favorites and playlists", () => {
        const { history, store } = renderHero({
            favorite: { favorite: [lecture(5, "Saved talk")], subCatsVisible: true },
        });
        fireEvent.click(screen.getByText("Favorites (1)"));
        expect(history.location.pathname).toBe("/favorites");
        expect(store.getState().favorite.subCatsVisible).toBe(false);
        fireEvent.click(screen.getByText("Playlists"));
        expect(history.location.pathname).toBe("/playlist");
    });
});
