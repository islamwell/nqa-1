import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Paper, IconButton } from "@material-ui/core";
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { useDispatch, useSelector } from "react-redux";
import { changeURL } from "../../store/slices/playerSlice";
import Image from "../Image";

const useStyles = makeStyles((theme) => ({
    mainContainer: {
        borderRadius: 10,

        [theme.breakpoints.down("sm")]: {
            padding: theme.spacing(5),
        },

        [theme.breakpoints.up("sm")]: {
            paddingInline: theme.spacing(3),
            paddingBlock: theme.spacing(2),
        },
    },

    itemContainer: {
        cursor: "pointer",
    },

    image: {
        height: 50,
        width: 50,
        borderRadius: 30,
    },
}));

export default function RecentlyPlayed() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { recentlyPlayed } = useSelector((state) => state.player);
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
                <Box display="flex" justifyContent="center" alignItems="center" my={10}>
                    No recent audios...
                </Box>
            )}
            {recentlyPlayed
                .slice()
                .reverse()
                .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                .map((item, key) => (
                    <Box
                        onClick={() => handlePlay(item.name, item.link, item.id, item.image, item.categoryId)}
                        className={classes.itemContainer}
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
