import React from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./containers/home";
import Catergory from "./containers/catergory";
import Player from "./containers/player";
import Layout from "./containers/layout";
import Search from "./containers/search";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

import FavoritePage from "./containers/favoritePage/FavoritePage";
import Playlist from "./containers/playlist";
import PlaylistDetail from "./containers/playlist/PlaylistDetail";

const theme = createMuiTheme({
  typography: {
    fontFamily: "Inter, Roboto, Arial",
  },
  palette: {
    primary: {
      main: "#0f766e",
    },
    secondary: {
      main: "#14b8a6",
    },
    background: {
      default: "#0b1224",
      paper: "#0f172a",
    }
  },
});


function App() {

  return (
    <ThemeProvider theme={theme}>
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
            <Route exact path="/">
              <Home />
            </Route>
          </Switch>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
