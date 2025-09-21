/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useRef } from "react";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import { useDispatch, useSelector } from "react-redux";
import { IconButton, Typography } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import { closePlayer, playNextOrPrevious, toggle } from "../../store/slices/playerSlice";
import { minimize, maximize } from "../../store/slices/playerSlice";
import "react-h5-audio-player/lib/styles.css";
import "./player.css";
import { useHistory } from "react-router-dom";
import * as offlineAPI from "../../db/services";
import { navigateToCategory } from "../../helpers/navigateToCategory";
import { ActionList } from "../../components";

const useStyles = makeStyles((theme) => ({
    root: {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.palette.primary.main,

        [theme.breakpoints.down("xs")]: {
            padding: theme.spacing(0, 0.5, 1, 0.5),
        },

        [theme.breakpoints.up("xs")]: {
            height: 120, // 145
        },
    },

    coverImage: {
        [theme.breakpoints.down("xs")]: {
            display: "none",
        },

        [theme.breakpoints.up("xs")]: {
            height: 120,
            width: 120,
        },
    },

    player: {
        boxShadow: "none",
        backgroundColor: theme.palette.primary.main,
    },

    playerContainer: {
        width: "100%",
    },

    categoryTitle: {
        color: "white",
        cursor: "pointer",
        textDecoration: "underline",

        "&:hover": {
            backgroundColor: theme.palette.primary.dark
        },
        padding: theme.spacing(1, 0, 1, 0),
        [theme.breakpoints.down("xs")]: {
            fontSize: 13,
        },

        [theme.breakpoints.up("sm")]: {},
    },

    title: {
        color: "white",
        [theme.breakpoints.down("xs")]: {
            padding: theme.spacing(1, 0, 1, 0),
            fontSize: 11,
        },

        [theme.breakpoints.up("sm")]: {
            padding: theme.spacing(1, 0, 1, 0),
            fontSize: 14,
        },
    },
    controlButton: {
        padding: 4,
        '& svg': {
            fontSize: 18,
        },
        minWidth: 32,
        height: 32,
    },
}));

export default function Player() {
    const playerRef = useRef(null);

    const classes = useStyles();

    const { link, name, id, categoryId, currentAudioList, open, minimized, playing } = useSelector((state) => state.player);
    const dispatch = useDispatch();
    const theme = useTheme();
    const history = useHistory();

    const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

    const handleCloseButton = () => {
        dispatch(closePlayer());
    };

    const handleNext = () => {
        dispatch(playNextOrPrevious("next"));
    };

    const handlePrevious = () => {
        dispatch(playNextOrPrevious("previous"));
    };

    const onCategoryClick = () => {
        navigateToCategory(categoryId, history);
    };

    const togglePlayer = (status) => {
        dispatch(toggle(status));
    };

    const handleMaximize = () => {
        dispatch(maximize());
    };

    const handleTogglePlayPause = () => {
        const audio = document.getElementsByTagName('audio')[0];
        if (!audio) return;
        if (audio.paused) {
            audio.play();
            dispatch(toggle(true));
        } else {
            audio.pause();
            dispatch(toggle(false));
        }
    };

    const categoryName = useMemo(() => offlineAPI.getCategoryById(categoryId)?.name, [categoryId]);

    // add listner to detect the end of the audio

    useEffect(() => {
        const player = document.getElementsByTagName("audio")[0];
        if (player && !player?.onended) {
            player.onended = function (e) {
                handleNext();
            };
        }
    }, [id]);

    const matches = useMediaQuery('(max-width:768px)');
    const sm = useMediaQuery('(max-width:362px)');

    if (!open) return null;

    return (
        <Box
            className={classes.root}
            display="flex"
            alignItems={minimized ? 'center' : 'stretch'}
            zIndex={2}
            style={
                minimized
                    ? { height: '56px' }
                    : (sm ? { height: '160px' } : matches ? { height: '145px' } : {})
            }
        >
            <Box className={classes.playerContainer} width="100%" display="flex" flexDirection="column" justifyContent={minimized ? 'center' : 'flex-start'}>
                {minimized ? (
                    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" px={1} py={0.5} style={{ height: '100%' }}>
                        <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                            <IconButton size="small" className={classes.controlButton} onClick={handleTogglePlayPause}>
                                {playing ? <PauseIcon style={{ color: 'white' }} /> : <PlayArrowIcon style={{ color: 'white' }} />}
                            </IconButton>
                            <Box onClick={onCategoryClick} style={{ cursor: 'pointer' }}>
                                <Typography className={classes.title} noWrap>{name}</Typography>
                            </Box>
                        </Box>

                        <Box display="flex" alignItems="center" style={{ height: '100%', gap: 2 }} mr={2}>
                                <IconButton size="small" className={classes.controlButton} onClick={handleMaximize}>
                                    <ExpandLessIcon style={{ color: 'white' }} />
                                </IconButton>
                                <IconButton size="small" className={classes.controlButton} onClick={handleCloseButton}>
                                    <CloseIcon style={{ color: 'white' }} />
                                </IconButton>
                        </Box>
                    </Box>
                ) : (
                    <Box display="flex" justifyContent="space-between" alignItems="center" px={1}>
                        <Box display="flex" justifyContent="center" alignItems="center">
                            {categoryName && (
                                <>
                                    <Box
                                        onClick={onCategoryClick}
                                        className={classes.categoryTitle}
                                        display="flex"
                                        fontWeight="fontWeightBold"
                                    >
                                        {categoryName}
                                    </Box>
                                    <div style={{ color: "white" }}>&nbsp;-&nbsp;</div>
                                </>
                            )}
                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                className={classes.title}
                                component="div"
                                textOverflow="clip"
                                overflow="hidden"
                            >
                                {name}
                            </Box>
                        </Box>

                        <Box position="relative" style={{ height: '100%' }}>
                            <Box position="absolute" top={8} right={0} display="flex" alignItems="center" style={{ height: '100%', gap: 2 }}>
                                <IconButton size="small" className={classes.controlButton} onClick={() => dispatch(minimize())}>
                                    <ExpandMoreIcon style={{ color: 'white' }} />
                                </IconButton>
                                <IconButton size="small" className={classes.controlButton} onClick={handleCloseButton}>
                                    <CloseIcon style={{ color: 'white' }} />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>
                )}

                <AudioPlayer
                    id="audio-player"
                    ref={playerRef}
                    style={minimized ? { position: 'absolute', left: '-9999px', visibility: 'hidden' } : undefined}
                    showJumpControls={false}
                    showSkipControls
                    layout={isMobile ? "stacked" : "horizontal-reverse"}
                    customAdditionalControls={[
                        RHAP_UI.LOOP,
                        matches ? null :
                            <ActionList data={{ link, name, id, categoryId, category_id: 0, image: currentAudioList.filter(audio => audio.id === id)[0]?.image }} currentPlayingPosition="player" />
                    ]}
                    className={classes.player}
                    autoPlay
                    src={link}
                    onClickNext={handleNext}
                    onClickPrevious={handlePrevious}
                    onPlay={() => togglePlayer(true)}
                    onPause={() => togglePlayer(false)}
                    footer={!matches ? null :
                        (
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <ActionList data={{ link, name, id, categoryId, category_id: 0, image: currentAudioList.filter(audio => audio.id === id)[0]?.image }} currentPlayingPosition="player" />
                            </Box>
                        )
                    }
                //crossOrigin="anonymous"
                />
            </Box>
        </Box>
    );
}