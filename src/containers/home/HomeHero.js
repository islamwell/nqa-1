import React from "react";
import { Box, Button, Typography } from "@material-ui/core";
import { fade, makeStyles } from "@material-ui/core/styles";
import PlayArrowRoundedIcon from "@material-ui/icons/PlayArrowRounded";
import PauseRoundedIcon from "@material-ui/icons/PauseRounded";
import FavoriteRoundedIcon from "@material-ui/icons/FavoriteRounded";
import QueueMusicRoundedIcon from "@material-ui/icons/QueueMusicRounded";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { changeURL } from "../../store/slices/playerSlice";
import { changeSubCatsVisible } from "../../store/slices/favoriteSlice";

// Eight-point star tile, drawn as an outline so it reads as a quiet pattern.
const starPattern = encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>" +
    "<g fill='none' stroke='white' stroke-width='1'>" +
    "<rect x='18' y='18' width='28' height='28'/>" +
    "<rect x='18' y='18' width='28' height='28' transform='rotate(45 32 32)'/>" +
    "</g></svg>"
);

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 20,
    marginTop: theme.spacing(3),
    padding: theme.spacing(4, 5),
    color: "#fff",
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, #0f2027 55%, #141e30 100%)`,
    boxShadow: `0 14px 34px ${fade(theme.palette.primary.dark, 0.35)}`,
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.spacing(2),
      padding: theme.spacing(2.5, 2.5),
      borderRadius: 16,
    },
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      backgroundImage: `url("data:image/svg+xml,${starPattern}")`,
      backgroundSize: "64px 64px",
      opacity: 0.07,
      WebkitMaskImage: "linear-gradient(100deg, transparent 35%, #000 85%)",
      maskImage: "linear-gradient(100deg, transparent 35%, #000 85%)",
      pointerEvents: "none",
    },
    "&::after": {
      content: '""',
      position: "absolute",
      width: 320,
      height: 320,
      right: -80,
      top: -140,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${fade(theme.palette.primary.light, 0.45)} 0%, transparent 70%)`,
      pointerEvents: "none",
    },
  },
  content: {
    position: "relative",
    zIndex: 1,
    maxWidth: 620,
  },
  overline: {
    display: "inline-block",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    padding: theme.spacing(0.5, 1.25),
    borderRadius: 999,
    background: fade("#fff", 0.12),
    marginBottom: theme.spacing(1.5),
  },
  title: {
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    fontSize: "2.2rem",
    [theme.breakpoints.down("xs")]: {
      fontSize: "1.55rem",
    },
  },
  arabic: {
    display: "block",
    fontWeight: 400,
    fontSize: "1.15rem",
    opacity: 0.75,
    textAlign: "left",
    marginTop: theme.spacing(0.5),
    fontFamily: "'Amiri', 'Scheherazade', 'Traditional Arabic', serif",
  },
  subtitle: {
    marginTop: theme.spacing(1.5),
    opacity: 0.85,
    maxWidth: 520,
    [theme.breakpoints.down("xs")]: {
      fontSize: 14,
    },
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(3),
    [theme.breakpoints.down("xs")]: {
      gap: theme.spacing(1),
      marginTop: theme.spacing(2),
    },
  },
  primaryAction: {
    borderRadius: 999,
    textTransform: "none",
    fontWeight: 600,
    padding: theme.spacing(1, 2.5),
    maxWidth: "100%",
    color: theme.palette.primary.dark,
    backgroundColor: "#fff",
    boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
    "&:hover": {
      backgroundColor: fade("#fff", 0.9),
    },
  },
  primaryLabel: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  secondaryAction: {
    borderRadius: 999,
    textTransform: "none",
    fontWeight: 600,
    padding: theme.spacing(1, 2),
    color: "#fff",
    borderColor: fade("#fff", 0.4),
    "&:hover": {
      borderColor: "#fff",
      backgroundColor: fade("#fff", 0.08),
    },
  },
}));

export default function HomeHero() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { recentlyPlayed, id: currentId, playing } = useSelector((state) => state.player);
  const { favorite } = useSelector((state) => state.favorite);

  const lastPlayed = recentlyPlayed && recentlyPlayed.length > 0 ? recentlyPlayed[recentlyPlayed.length - 1] : null;

  const isCurrent = Boolean(lastPlayed) && String(lastPlayed.id) === String(currentId);
  const isPlayingNow = isCurrent && playing;

  const handleContinue = () => {
    if (!lastPlayed) return;
    if (isCurrent) {
      // Same lecture is already loaded in the player: resume or pause it, like the list items do.
      const player = document.getElementsByTagName("audio")[0];
      if (player) {
        if (player.paused) player.play();
        else player.pause();
        return;
      }
    }
    dispatch(
      changeURL({
        name: lastPlayed.name,
        link: lastPlayed.link,
        id: lastPlayed.id,
        image: lastPlayed.image,
        categoryId: lastPlayed.categoryId,
        currentPlayingPosition: "recentlyPlayed",
      })
    );
  };

  const goTo = (path) => {
    dispatch(changeSubCatsVisible({ subCatsVisible: false }));
    history.push(path);
  };

  return (
    <Box component="section" className={classes.root} aria-label="Welcome">
      <div className={classes.content}>
        <span className={classes.overline}>NurulQuran Audio</span>
        <Typography component="h1" className={classes.title}>
          Assalamu Alaikum
          <span className={classes.arabic} lang="ar" dir="rtl">
            السلام عليكم
          </span>
        </Typography>
        <Typography className={classes.subtitle}>
          Lectures on the Quran, Seerah, Dua and more. Stream them here or save them for offline listening.
        </Typography>
        <div className={classes.actions}>
          {lastPlayed && (
            <Button
              variant="contained"
              className={classes.primaryAction}
              startIcon={isPlayingNow ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
              onClick={handleContinue}
              title={lastPlayed.name}
            >
              <span className={classes.primaryLabel}>
                {isPlayingNow ? "Now playing" : "Continue"}: {lastPlayed.name}
              </span>
            </Button>
          )}
          <Button
            variant="outlined"
            className={classes.secondaryAction}
            startIcon={<FavoriteRoundedIcon />}
            onClick={() => goTo("/favorites")}
          >
            Favorites{favorite && favorite.length > 0 ? ` (${favorite.length})` : ""}
          </Button>
          <Button
            variant="outlined"
            className={classes.secondaryAction}
            startIcon={<QueueMusicRoundedIcon />}
            onClick={() => goTo("/playlist")}
          >
            Playlists
          </Button>
        </div>
      </div>
    </Box>
  );
}
