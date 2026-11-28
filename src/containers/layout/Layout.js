import { ToastContainer } from "react-toastify";
import {Container} from "@material-ui/core";
import React from "react";
import { useLocation } from "react-router-dom";
import TopBar from "../topBar";
import Player from "../player";
import CategorySlider from "../../components/TopChart/CategorySlider";
import HomeHero from "../home/HomeHero";

export default function Layout({ children }) {
    const { pathname } = useLocation();
    const showCategorySlider = pathname !== "/settings";
    const isHome = pathname === "/" || pathname === "/item";

    return (
        <div>
            <TopBar/>
            <Container maxWidth="md">
              {/* <TopChart data={topChart} getMore={getMore} /> */}
              {isHome && <HomeHero/>}
              {showCategorySlider && <CategorySlider/>}
            </Container>
            <div id="app-main-content">
                {children}
                <Player />
            </div>
            <ToastContainer autoClose={1000} className="notification-container-copied" />
        </div>
    );
}
