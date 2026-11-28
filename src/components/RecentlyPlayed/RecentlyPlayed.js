import React, { useState, useEffect } from "react";
import { fade, makeStyles } from "@material-ui/core/styles";
import { Box, Paper, IconButton } from "@material-ui/core";
import HeadsetRoundedIcon from '@material-ui/icons/HeadsetRounded';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { useDispatch, useSelector } from "react-redux";
import { changeURL } from "../../store/slices/playerSlice";
import Image from "../Image";

const useStyles = makeStyles((theme) => ({
    mainContainer: {
        borderRadius: 16,
        borderColor: fade(theme.palette.primary.main, 0.14),
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        padding: theme.spacing(1.5),
        [theme.breakpoints.up("sm")]: {
            padding: theme.spacing(2),
        },
    },

    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: theme.spacing(4, 2),
        color: fade(theme.palette.text.primary, 0.65),
        "& svg": {
            fontSize: 40,
            color: fade(theme.palette.primary.main, 0.5),
            marginBottom: theme.spacing(1),
        },
    },

    emptyTitle: {
        fontWeight: 600,
        color: theme.palette.text.primary,
    },
    itemContainer: {
        cursor: "pointer",
        transition: "all 0.3s ease",
        borderRadius: 10,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        "&:hover": {
            backgroundColor: fade(theme.palette.primary.main, 0.08),
        },
    },

    playingItemContainer: {
        cursor: "pointer",
        backgroundColor: fade(theme.palette.primary.main, 0.15),
        borderLeft: `4px solid ${theme.palette.primary.main}`,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        borderRadius: 8,
        animation: "$pulse 2s infinite",
        transition: "all 0.3s ease",
    },

    "@keyframes pulse": {
        "0%": {
            boxShadow: `0 0 0 0 ${fade(theme.palette.primary.main, 0.4)}`,
        },
        "70%": {
            boxShadow: `0 0 0 10px ${fade(theme.palette.primary.main, 0)}`,
        },
        "100%": {
            boxShadow: `0 0 0 0 ${fade(theme.palette.primary.main, 0)}`,
        },
    },

    image: {
        height: 46,
        width: 46,
        borderRadius: "50%",
        objectFit: "cover",
        boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
    },
}));

export default function RecentlyPlayed() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { recentlyPlayed, id: playingId } = useSelector((state) => state.player);
    const itemsPerPage = 5;
    const [page, setPage] = useState(1);
    const noOfPages = Math.max(1, Math.ceil(recentlyPlayed.length / itemsPerPage));
    const showPagination = noOfPages > 1;

    useEffect(() => {
        const newNoOfPages = Math.max(1, Math.ceil(recentlyPlayed.length / itemsPerPage));
        if (page > newNoOfPages) {
            setPage(newNoOfPages);
        }
        if (recentlyPlayed.length > 0 && page < 1) {
            setPage(1);
        }
    }, [recentlyPlayed.length, page, itemsPerPage]);

    const handlePlay = (name, link, id, image, categoryId) => {
        dispatch(changeURL({ name, link, id, image, categoryId,currentPlayingPosition: "recentlyPlayed" }));
    };

    return (
        <Paper variant="outlined" className={classes.mainContainer}>
            {recentlyPlayed.length === 0 && (
                <Box className={classes.emptyState}>
                    <HeadsetRoundedIcon />
                    <span className={classes.emptyTitle}>No recent audios yet</span>
                    <span>Lectures you play will show up here.</span>
                </Box>
            )}
            {recentlyPlayed
                .slice()
                .reverse()
                .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                .map((item, key) => (
                    <Box
                        onClick={() => handlePlay(item.name, item.link, item.id, item.image, item.categoryId)}
                        className={String(item.id) === String(playingId) ? classes.playingItemContainer : classes.itemContainer}
                        display="flex"
                        alignItems="center"
                        paddingTop={1}
                        paddingBottom={1}
                        key={key}
                    >
                        <Image src={item.image} className={classes.image} />
                        <Box marginLeft={2} fontWeight="fontWeightMedium" fontSize="body2.fontSize">
                            {item.name}
                        </Box>
                    </Box>
                ))}
                    {showPagination && (
                        <Box my={2} display="flex" justifyContent="flex-end" alignItems="center">
                            <IconButton
                                size="small"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                aria-label="previous page"
                            >
                                <ArrowBackIosIcon fontSize="small" />
                            </IconButton>

                            <Box mx={1} fontSize="body2.fontSize">
                                {page} / {noOfPages}
                            </Box>

                            <IconButton
                                size="small"
                                onClick={() => setPage((p) => Math.min(noOfPages, p + 1))}
                                disabled={page >= noOfPages}
                                aria-label="next page"
                            >
                                <ArrowForwardIosIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )}
        </Paper>
    );
}
