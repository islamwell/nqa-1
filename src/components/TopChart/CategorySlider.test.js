import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import playerReducer from "../../store/slices/playerSlice";
import downloadReducer from "../../store/slices/downloadSlice";
import favoriteReducer from "../../store/slices/favoriteSlice";
import CategorySlider from "./CategorySlider";

jest.mock("react-slick", () => {
    const React = require("react");
    return React.forwardRef(function DummySlider({ children }, ref) {
        return (
            <div ref={ref} data-testid="mock-slider">
                {children}
            </div>
        );
    });
});

const createTestStore = () =>
    configureStore({
        reducer: {
            player: playerReducer,
            download: downloadReducer,
            favorite: favoriteReducer,
        },
    });

describe("CategorySlider breadcrumb and category navigation", () => {
    it("displays nested Juzz 30 Surah subcategories (not Al-Quran root subcategories) on deep URL", () => {
        const store = createTestStore();
        const history = createMemoryHistory({
            initialEntries: ["/category/Al-Quran/Detailed-Tafseer/Tafseer-Juzz-30"],
        });

        render(
            <Provider store={store}>
                <Router history={history}>
                    <CategorySlider />
                </Router>
            </Provider>
        );

        // Breadcrumb items
        expect(screen.getByText("Detailed Tafseer")).toBeInTheDocument();
        expect(screen.getByText("Tafseer Juzz 30")).toBeInTheDocument();

        // Juzz 30's 31 Surah cards should be rendered, NOT Al-Quran's top-level children
        expect(screen.getByText("Surah AnNaba")).toBeInTheDocument();
        expect(screen.getByText("Surah Lahab till AnNaas")).toBeInTheDocument();
        expect(screen.queryByText("Short Overview")).not.toBeInTheDocument();
    });

    it("allows navigating up via breadcrumb and clicking back into the same subcategory card", () => {
        const store = createTestStore();
        const history = createMemoryHistory({
            initialEntries: ["/category/Al-Quran/Detailed-Tafseer"],
        });

        render(
            <Provider store={store}>
                <Router history={history}>
                    <CategorySlider />
                </Router>
            </Provider>
        );

        expect(screen.getByText("Tafseer Juzz 01")).toBeInTheDocument();

        // Click Al-Quran in breadcrumb (the one inside Breadcrumbs list, not the slider)
        const alQuranLinks = screen.getAllByText("Al-Quran");
        const breadcrumbAlQuran = alQuranLinks[alQuranLinks.length - 1];
        fireEvent.click(breadcrumbAlQuran);

        expect(history.location.pathname).toBe("/category/Al-Quran");
        expect(screen.getByText("Detailed Tafseer")).toBeInTheDocument();

        // Clicking Detailed Tafseer card again must navigate back into /category/Al-Quran/Detailed-Tafseer
        fireEvent.click(screen.getByText("Detailed Tafseer"));
        expect(history.location.pathname).toBe("/category/Al-Quran/Detailed-Tafseer");
        expect(screen.getByText("Tafseer Juzz 01")).toBeInTheDocument();
    });

    it("restores subcategory cards after visiting a leaf category and returning to a parent category", () => {
        const store = createTestStore();
        const history = createMemoryHistory({
            initialEntries: ["/category/Al-Quran/Detailed-Tafseer/Tafseer-Juzz-30"],
        });

        render(
            <Provider store={store}>
                <Router history={history}>
                    <CategorySlider />
                </Router>
            </Provider>
        );

        // Click leaf category Surah AnNaba
        fireEvent.click(screen.getByText("Surah AnNaba"));
        expect(history.location.pathname).toBe(
            "/category/Al-Quran/Detailed-Tafseer/Tafseer-Juzz-30/Surah-AnNaba"
        );

        // Now click Tafseer Juzz 30 in breadcrumb to return to parent
        fireEvent.click(screen.getByText("Tafseer Juzz 30"));
        expect(history.location.pathname).toBe("/category/Al-Quran/Detailed-Tafseer/Tafseer-Juzz-30");
        // Subcategory cards must be visible again
        expect(screen.getByText("Surah AnNaziat")).toBeInTheDocument();
    });

    it("hides breadcrumbs and subcategory grid when leaving /category/ routes", () => {
        const store = createTestStore();
        const history = createMemoryHistory({
            initialEntries: ["/category/Al-Quran/Detailed-Tafseer/Tafseer-Juzz-30"],
        });

        render(
            <Provider store={store}>
                <Router history={history}>
                    <CategorySlider />
                </Router>
            </Provider>
        );

        expect(screen.getByText("Surah AnNaba")).toBeInTheDocument();

        // Navigate to /favorites or /
        history.push("/favorites");
        expect(screen.queryByText("Surah AnNaba")).not.toBeInTheDocument();
        expect(screen.queryByText("Tafseer Juzz 30")).not.toBeInTheDocument();
    });
});
