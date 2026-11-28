import React, { useEffect, useState } from "react";
import { fade, makeStyles } from "@material-ui/core/styles";
import { Box, IconButton, Paper } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { changeURL } from "../../store/slices/playerSlice";
import PauseCircleOutlineRoundedIcon from "@material-ui/icons/PauseCircleOutlineRounded";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import parse from "html-react-parser";

import { ActionList, Image, DynamicAvatar } from "../../components";
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },

  mainContainer: {
    display: "flex",
    marginBottom: theme.spacing(1.5),
    borderRadius: 14,
    overflow: "hidden",
    borderColor: fade(theme.palette.primary.main, 0.14),
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out",
    "&:hover": {
      transform: "translateY(-2px)",
      borderColor: fade(theme.palette.primary.main, 0.35),
      boxShadow: `0 8px 20px ${fade(theme.palette.primary.dark, 0.14)}`,
    },

    [theme.breakpoints.down("sm")]: {
      //padding: theme.spacing(3, 1, 3, 1),
    },

    [theme.breakpoints.up("sm")]: {
      //padding: theme.spacing(1, 1, 1, 1),
    },
  },
  playingContainer: {
    boxShadow: "0 0 15px 3px rgba(46, 204, 113, 0.4) !important", // Elegant green glow
    borderColor: "rgba(46, 204, 113, 0.6)",
    transform: "scale(1.01)",
    transition: "all 0.3s ease",
  },
  title: {
    cursor: "pointer",
    width: "100%",
    fontWeight: 600,
    lineHeight: 1.35,
    [theme.breakpoints.down("sm")]: {
      fontSize: 14,
    },

    [theme.breakpoints.up("sm")]: {
      fontSize: 16,
    },
  },

  buttonContianer: {
    height: 26,
    width: 26,
  },
  image: {
    height: 96,
    width: 96,
    flexShrink: 0,
    objectFit: "cover",
    [theme.breakpoints.down("xs")]: {
      height: 88,
      width: 76,
      fontSize: "1.5rem !important",
    },
  },

  buttonOutline: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    border: "solid 0.1rem green",
    height: 15,
    width: 15,
    margin: theme.spacing(0, 1, 0, 1),
    padding: 0,
  },

  button: {
    height: 12,
    width: 12,
    color: "green",
  },

  iconButton: {
    padding: 0,
    margin: 0,
  },
}));

export default function ListItem({ data, currentPlayingPosition, children }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [, setIsDownloaded] = useState(false);
  const { downloadingIds } = useSelector((state) => state.download);
  const { id: currentPlayingId, playing } = useSelector(
    (state) => state.player
  );

  const { id, name, link, image, categoryId, category_id, highlightName } =
    data;

  const handlePlay = () => {
    dispatch(
      changeURL({
        name: name,
        link: link,
        id: id,
        image: image,
        categoryId: categoryId || category_id,
        currentPlayingPosition: currentPlayingPosition,
      })
    );
  };
  const togglePlay = () => {
    const player = document.getElementsByTagName("audio")[0];

    if (player) {
      if (player.paused) {
        player.play();
      } else {
        player.pause();
      }
    } 
  };

  useEffect(() => {
    caches
      .match(new Request(link))
      .then((res) => {
        if (res) setIsDownloaded(true); //checking whether already downloaaded
      })
      .catch((e) => { });
  }, [downloadingIds, link]);

  // is Generic image check
  const isGenericImage = !image || image.includes("ic_music_node.png");
  const isCurrentlyPlaying = playing && id === currentPlayingId;

  return (
  <Paper variant="outlined" className={`${classes.mainContainer} ${isCurrentlyPlaying ? classes.playingContainer : ''}`}>
      {isGenericImage ? (
        <DynamicAvatar name={name} className={classes.image} />
      ) : (
        <Image src={image} className={classes.image} />
      )}
      <Box
        px={1}
        py={1}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        width={'100%'}
        style={{gap: 2}}
      >
          <Box display="flex" justifyContent="flex-start" alignItems="center">
            {/* {id === currentPlayingId && ( */}
            <IconButton className={classes.iconButton} onClick={id === currentPlayingId ? togglePlay : handlePlay} size="small">
              {(playing && id === currentPlayingId) ? (
                <PauseCircleOutlineRoundedIcon
                  fontSize="large"
                  color="primary"
                />
              ) : (
                <PlayCircleOutlineIcon
                  fontSize="large"
                  color="primary"
                />
              )}
            </IconButton>
            {/* )} */}

            <Box
              onClick={handlePlay}
              className={classes.title}
              textAlign="left"
              fontWeight="fontWeightMedium"
              fontSize="subtitle2.fontSize"
              ml={1}
              pr={1}
            >
              {highlightName ? parse(highlightName) : name}
            </Box>
          </Box>

        <ActionList data={data} currentPlayingPosition={currentPlayingPosition} children={children} />
      </Box>
    </Paper>
  );
}
