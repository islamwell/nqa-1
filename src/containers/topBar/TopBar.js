/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { fade, makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import InputBase from "@material-ui/core/InputBase";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import UpdateIcon from "@material-ui/icons/Update";
import WifiIcon from "@material-ui/icons/Wifi";
import WifiOffIcon from "@material-ui/icons/WifiOff";
import { useHistory } from "react-router-dom";
import { DownalodNotification, Backdrop, DesktopDropdownMenu, MobileDropdownMenu } from "../../components";
import { Button, Chip, Menu, MenuItem, Tooltip, Typography } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { downloadAudioList, updateOfflineStatus } from "../../store/slices/downloadSlice";
import ArchiveIcon from "@material-ui/icons/Archive";
import { version } from "../../data/config";
import { changeSubCatsVisible } from "../../store/slices/favoriteSlice";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  appBar: {
    background: "linear-gradient(120deg, #0f172a 0%, #0f766e 50%, #14b8a6 100%)",
    color: "#e0f2f1",
    boxShadow: "0 12px 32px rgba(20, 184, 166, 0.35)",
    backdropFilter: "blur(8px)",
  },
  menuButton: {
    display: "block",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
    //marginRight: theme.spacing(2),
  },

  toolbar1: {
    minHeight: 76,
    padding: theme.spacing(1, 2),
    display: "flex",
    alignItems: "center",
    maxWidth: "100%",
    gap: theme.spacing(2),
  },
  toolbar2: {
    minHeight: 40,
    //maxWidth: "100%",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  title: {
    fontWeight: 700,
    letterSpacing: "0.8px",
    fontSize: "1.15rem",
    textTransform: "none",
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "block",
    },
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: "rgba(255,255,255,0.14)",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.2)",
      boxShadow: "0 6px 20px rgba(12, 159, 141, 0.35)",
    },
    boxShadow: "0 4px 18px rgba(15, 23, 42, 0.22)",
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

  statusGroup: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginLeft: theme.spacing(2),
  },
  statusChip: {
    backgroundColor: "rgba(255,255,255,0.12)",
    color: "#ecfdf3",
    border: "1px solid rgba(255,255,255,0.18)",
  },
  updateChip: {
    backgroundColor: "rgba(248, 180, 0, 0.18)",
    color: "#ffecb3",
    border: "1px solid rgba(255,255,255,0.28)",
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
  const [onlineStatus, setOnlineStatus] = useState(window.navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

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

  const handleSearch = (e) => {
    dispatch(
      changeSubCatsVisible(
        {
          subCatsVisible: false
        }
      )
    )
    history.push(`/search?${e.target.value}`);
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

  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOfflineStatus = () => setOnlineStatus(false);
    const handleOfflineReady = () => {
      setOfflineReady(true);
      toast.success("Offline cache is ready for use");
      setTimeout(() => setOfflineReady(false), 6000);
    };
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
      toast.info("New version detected. Updating now...");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOfflineStatus);
    window.addEventListener("pwa-ready", handleOfflineReady);
    window.addEventListener("pwa-update-available", handleUpdateAvailable);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOfflineStatus);
      window.removeEventListener("pwa-ready", handleOfflineReady);
      window.removeEventListener("pwa-update-available", handleUpdateAvailable);
    };
  }, []);

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
      <AppBar className={classes.appBar} position="sticky">
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
            <Typography variant="caption" style={{ opacity: 0.72, marginLeft: 8 }}>
              Enrich your recitation anywhere
            </Typography>
          </div>

          <div className={classes.grow} />
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              onChange={handleSearch}
              placeholder="Search…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ "aria-label": "search" }}
            />
          </div>
          <div className={classes.statusGroup}>
            <Tooltip title={onlineStatus ? "You are online" : "You are offline. Using cached content"}>
              <Chip
                size="small"
                icon={onlineStatus ? <WifiIcon style={{ color: "#bbf7d0" }} /> : <WifiOffIcon style={{ color: "#fecdd3" }} />}
                label={onlineStatus ? "Online" : "Offline"}
                className={classes.statusChip}
              />
            </Tooltip>
            {offlineReady && (
              <Tooltip title="Content cached for offline playback">
                <Chip size="small" icon={<ArchiveIcon style={{ color: "#b3e5fc" }} />} label="Offline Ready" className={classes.statusChip} />
              </Tooltip>
            )}
            {updateAvailable && (
              <Tooltip title="Applying the latest version">
                <Chip size="small" icon={<UpdateIcon style={{ color: "#ffe082" }} />} label="Updating" className={classes.updateChip} />
              </Tooltip>
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
              <MenuItem button={false}>v{version}</MenuItem>
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
