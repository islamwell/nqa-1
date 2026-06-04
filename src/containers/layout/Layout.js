import { ToastContainer } from "react-toastify";
import {Container} from "@material-ui/core";
import React from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import TopBar from "../topBar";
import Player from "../player";
import CategorySlider from "../../components/TopChart/CategorySlider";

export default function Layout({ children }) {
    const { pathname } = useLocation();
    const showCategorySlider = pathname !== "/settings";
    const { open, minimized } = useSelector((state) => state.player);

    // Dynamic padding bottom depending on player display mode
    let paddingBottom = 40;
    if (open) {
        if (minimized) {
            paddingBottom = 100;
        } else {
            paddingBottom = 180;
        }
    }

    return (
        <div>
            <TopBar/>
            <Container maxWidth="md">
              {/* <TopChart data={topChart} getMore={getMore} /> */}
              {showCategorySlider && <CategorySlider/>}
            </Container>
            <div id="app-main-content" style={{ paddingBottom }}>
                {children}
                <Player />
            </div>
            <ToastContainer autoClose={1000} className="notification-container-copied" />
        </div>
    );
}
