/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { fade, makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import InputBase from "@material-ui/core/InputBase";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import { useHistory, useLocation } from "react-router-dom";
import { DownalodNotification, Backdrop, DesktopDropdownMenu, MobileDropdownMenu } from "../../components";
import { Button, Menu, MenuItem, Paper } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { downloadAudioList, updateOfflineStatus } from "../../store/slices/downloadSlice";
import ArchiveIcon from "@material-ui/icons/Archive";
import PaletteIcon from "@material-ui/icons/Palette";
import { version } from "../../data/config";
import { changeSubCatsVisible } from "../../store/slices/favoriteSlice";
const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    display: "block",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
    //marginRight: theme.spacing(2),
  },

  toolbar1: {
    minHeight: 60,
    [theme.breakpoints.up("md")]: {
      backgroundColor: theme.palette.primary.dark,
    },

    maxWidth: "100%",
  },
  toolbar2: {
    minHeight: 40,
    //maxWidth: "100%",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  title: {
    fontWeight: "bold",
    fontSize: "1.1rem",
    textTransform: "none",
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "block",
    },
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "16ch",
      "&:focus": {
        width: "25ch",
      },
    },
  },

  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },

  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },

  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },

  rightMenu: {
    padding: theme.spacing(2),
    width: 300,
  },
}));

export default function PrimarySearchAppBar() {
  const classes = useStyles();
  let history = useHistory();
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const isRightMenuOpen = Boolean(anchorEl);

  const { audioListDownloadProgress, audioListDownaloding, downloadingIds } = useSelector(
    (state) => state.download
  );

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith('/search')) {
       setSearchValue(decodeURIComponent(location.search.replace('?', '')));
    } else {
       setSearchValue("");
    }
  }, [location.pathname, location.search]);

  const saveSearch = (term) => {
    if (!term || !term.trim()) return;
    const updated = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveSearch(searchValue);
      setSearchFocused(false);
      e.target.blur();
    }
  };

  const handleRecentClick = (term) => {
    setSearchValue(term);
    saveSearch(term);
    setSearchFocused(false);
    if (!history.location.pathname.startsWith('/search')) {
        history.push(`/search?${term}`);
    } else {
        history.replace(`/search?${term}`);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    dispatch(
      changeSubCatsVisible(
        {
          subCatsVisible: false
        }
      )
    );
    if (!history.location.pathname.startsWith('/search')) {
      history.push(`/search?${val}`);
    } else {
      history.replace(`/search?${val}`);
    }
  };

  const handleHomeButtom = () => {
    dispatch(
      changeSubCatsVisible(
        {
          subCatsVisible: false
        }
      )
    )
    history.push("/");
  };

  const handleOffline = async () => {
    if (localStorage.getItem("offline_mode") === 'true') {
      dispatch(updateOfflineStatus(true));
      return;
    }
    dispatch(downloadAudioList());
  };

  const handleOnSelect = () => {
    setOpen((state) => !state);
  };

  useEffect(() => {
    const storedVersion = localStorage.getItem('app_version');
    const compareVersions = (v1, v2) => {
      const parts1 = v1.split('.').map(Number);
      const parts2 = v2.split('.').map(Number);
      for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 > p2) return 1;
        if (p1 < p2) return -1;
      }
      return 0;
    };
    if (!storedVersion || compareVersions(version, storedVersion) > 0) {
      localStorage.setItem('app_version', version);
      dispatch(downloadAudioList());
    }
    handleOffline()
  }, [])

  // useEffect(() => {
  //     const getStatus = async () => {
  //         offlineAPI
  //             .getAudioCount()
  //             .then((res) => {
  //                 if (res > 0) dispatch(updateOfflineStatus(true));
  //             })
  //             .catch((e) => console.log(e));
  //     };
  //     getStatus();
  // }, []);

  const toggleMobileMenu = () => {
    setOpen((state) => !state);
  };

  const handleVersionClick = () => {
    handleClose();
    history.push("/settings");
  };

  useEffect(() => {
    if (open) {
      document.getElementById("app-main-content").style.display = " none";
    } else {
      document.getElementById("app-main-content").style.display = " unset";
    }
  }, [open]);
  return (
    <div className={classes.grow}>
      <Backdrop
        open={audioListDownaloding}
        progress={audioListDownloadProgress}
        message="Downloading data to enable offline search, please wait"
      />
      <AppBar style={{ boxShadow: "none" }} position="sticky">
        <Toolbar className={classes.toolbar1}>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="open drawer"
            onClick={toggleMobileMenu}
          >
            <MenuIcon />
          </IconButton>
          <div className={classes.sectionDesktop}>
            <Button onClick={handleHomeButtom} className={classes.title} color="inherit">
              NurulQuran
            </Button>
          </div>

          <div className={classes.grow} />
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              value={searchValue}
              onChange={handleSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              onKeyDown={handleKeyDown}
              placeholder="Search…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ "aria-label": "search" }}
            />
            {searchValue && (
              <IconButton 
                size="small" 
                onClick={() => {
                  setSearchValue("");
                  if (history.location.pathname.startsWith('/search')) {
                    history.push("/");
                  }
                }} 
                style={{ position: 'absolute', right: 5, top: 4, color: 'white' }}
              >
                <span style={{ fontSize: 16 }}>✕</span>
              </IconButton>
            )}
            {searchFocused && recentSearches.length > 0 && !searchValue && (
              <Paper style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 999, color: 'black' }}>
                <div style={{ padding: '8px 16px', fontSize: '0.8rem', color: 'gray', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Recent Searches</span>
                  <span style={{ cursor: 'pointer' }} onClick={() => { setRecentSearches([]); localStorage.removeItem('recent_searches'); }}>Clear</span>
                </div>
                {recentSearches.map((term, i) => (
                  <MenuItem key={i} onClick={() => handleRecentClick(term)}>
                    {term}
                  </MenuItem>
                ))}
              </Paper>
            )}
          </div>
          <div>
            <IconButton aria-controls="menu-appbar" aria-haspopup="true" onClick={handleMenu} color="inherit">
              <ArchiveIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              className={classes.rightMenu}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              open={isRightMenuOpen}
              onClose={handleClose}
            >
              {/* <MenuItem button={false}>
                <Box dispatch="flex" justifyContent="center" alignItems="center">
                  Offline mode
                  <Switch color="primary" onClick={handleOffline} checked={offlineMode} />
                </Box>
              </MenuItem> */}
              <MenuItem onClick={() => {
                history.push("/favorites")
                handleClose()
              }} button={true}> Favorites </MenuItem>
              <MenuItem onClick={() => {
                history.push("/playlist")
                handleClose()
              }} button={true}> Playlist </MenuItem>
              <MenuItem onClick={handleVersionClick} button={true}>
                v{version} <PaletteIcon style={{ fontSize: 16, marginLeft: 8 }} />
              </MenuItem>
              <MenuItem onClick={() => {
                handleClose();
                dispatch(downloadAudioList());
              }} button={true}>Update</MenuItem>
            </Menu>
          </div>

          {downloadingIds.length > 0 && <DownalodNotification />}
        </Toolbar>

        <Toolbar className={classes.toolbar2}>
          <DesktopDropdownMenu />
        </Toolbar>
      </AppBar>

      <MobileDropdownMenu open={open} onSelect={handleOnSelect} />
    </div>
  );
}
