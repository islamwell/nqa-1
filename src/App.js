import React from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./containers/home";
import Catergory from "./containers/catergory";
import Player from "./containers/player";
import Layout from "./containers/layout";
import Search from "./containers/search";

import FavoritePage from "./containers/favoritePage/FavoritePage";
import Playlist from "./containers/playlist";
import PlaylistDetail from "./containers/playlist/PlaylistDetail";
import Settings from "./containers/settings";
import PreferencesProvider from "./contexts/PreferencesContext";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeURL } from "./store/slices/playerSlice";

function App() {
  const dispatch = useDispatch();
  const { link } = useSelector((state) => state.player);

  useEffect(() => {
    // Only auto-play if nothing is currently playing/set
    if (!link) {
      dispatch(
        changeURL({
          id: 3072,
          name: "Quran is My life ",
          link: "https://nqapp.nurulquran.com/audios/Short-Series/Quran-Ki-Kirnain/01-Quran-is-my-Life-Edited-complete-Lec.mp3",
          categoryId: 613,
          image: "https://nqapp.nurulquran.com/images/www/ic_music_node.png",
          currentPlayingPosition: "home",
        })
      );
    }
  }, [dispatch, link]);

  return (
    <PreferencesProvider>
      <Router>
        <Layout>
          <Switch>
            <Route path="/category/:category/:subCategoryOne?/:subCategoryTwo?/:subCategoryThree?">
              <Catergory />
            </Route>
            <Route exact path="/item">
              <Player />
            </Route>
            <Route exact path="/search">
              <Search />
            </Route>
            <Route exact path="/favorites">
              <FavoritePage />
            </Route>
            <Route exact path="/playlist">
              <Playlist />
            </Route>
            <Route exact path="/playlist/detail">
              <PlaylistDetail />
            </Route>
            <Route exact path="/settings">
              <Settings />
            </Route>
            <Route exact path="/">
              <Home />
            </Route>
          </Switch>
        </Layout>
      </Router>
    </PreferencesProvider>
  );
}

export default App;
