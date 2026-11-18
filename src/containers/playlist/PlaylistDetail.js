import { Avatar, Box, Button, Container, IconButton, TextField, useMediaQuery, useTheme } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import CreateIcon from "@material-ui/icons/Create";
import ShuffleIcon from "@material-ui/icons/Shuffle";
import Pagination from "@material-ui/lab/Pagination";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { ListItem } from "../../components";
import { toast } from "react-toastify";
import CloseRounded from "@material-ui/icons/CloseRounded";
import { updateCurrentAudioList } from "../../store/slices/playerSlice";
import { nameFormat } from "../../utils";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        minHeight: `calc(100vh - 120px)`,
        padding: theme.spacing(5, 0, 10, 0),
    },

    avatar: {
        height: 150,
        width: 150,
        background: `radial-gradient(circle at 50% 50%, #000000 0%, #10373C 12%, #005EFF 48%, #D4E3F7 74%, #FFFFFF 100%)`,
    },

    categoryContainer: {
        padding: theme.spacing(3),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,

        [theme.breakpoints.down("sm")]: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "left",
            height: 100,
            alignItems: "center",
        },
    },
}));

export default function PlaylistDetail() {
    const classes = useStyles();
    const history = useHistory();
    const location = useLocation();
    const dispatch = useDispatch();
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down("xs"));
    const { playing } = useSelector((state) => state.player);

    const locationState = location?.state;

    // Helper functions for localStorage
    const getPlaylists = () => {
        try {
            return JSON.parse(localStorage.getItem("playlist")) || [];
        } catch (_) {
            return [];
        }
    };

    const savePlaylists = (lists) => {
        localStorage.setItem("playlist", JSON.stringify(lists));
    };

    const rawItem = locationState?.item;
    const initialIndex = locationState?.index ?? 0;
    const initialKey = rawItem ? Object.keys(rawItem)[0] : "";

    const [playlistName, setPlaylistName] = useState(initialKey);
    const [playlistItems, setPlaylistItems] = useState(rawItem && initialKey ? rawItem[initialKey] || [] : []);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [editable, setEditable] = useState(false);

    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(playlistItems.length / itemsPerPage));
    const showPagination = totalPages > 1;

    // Fallback if accessed directly or refreshed
    useEffect(() => {
        if (!locationState || !locationState.item) {
            const stored = getPlaylists();
            if (stored.length > 0 && stored[0]) {
                const firstKey = Object.keys(stored[0])[0];
                setPlaylistName(firstKey);
                setPlaylistItems(stored[0][firstKey] || []);
                setCurrentIndex(0);
            } else {
                history.replace("/playlist");
            }
        }
    }, [locationState, history]);

    useEffect(() => {
        dispatch(updateCurrentAudioList(playlistItems));
    }, [playlistItems, dispatch]);

    const handleRemove = (trackId) => {
        const localData = getPlaylists();
        const updatedArray = playlistItems.filter((play) => play.id !== trackId);
        if (localData[currentIndex]) {
            localData[currentIndex] = { [playlistName]: updatedArray };
            savePlaylists(localData);
        }
        setPlaylistItems(updatedArray);
        toast.info("Audio removed from playlist");
    };

    function handleEdit() {
        setEditable((pre) => !pre);
    }

    function handleSave() {
        const trimmed = String(playlistName).trim();
        if (!trimmed) {
            toast.error("Playlist must have a name");
            return;
        }

        const localData = getPlaylists();
        const conflictIndex = localData.findIndex(
            (p, idx) => Object.keys(p)[0] === trimmed && idx !== currentIndex
        );

        if (conflictIndex !== -1) {
            toast.error("A playlist with this name already exists!");
            return;
        }

        localData[currentIndex] = { [trimmed]: playlistItems };
        savePlaylists(localData);
        setPlaylistName(trimmed);
        toast.success("Playlist updated");
        setEditable(false);
    }

    function handleDelete() {
        const localData = getPlaylists();
        localData.splice(currentIndex, 1);
        savePlaylists(localData);
        toast.info("Playlist deleted");
        history.replace("/playlist");
    }

    function handleShuffle(array = []) {
        const arr = [...array];
        let cur = arr.length;
        while (cur !== 0) {
            const rand = Math.floor(Math.random() * cur);
            cur--;
            [arr[cur], arr[rand]] = [arr[rand], arr[cur]];
        }
        setPlaylistItems(arr);
    }

    const handleChangePage = (_, newPage) => {
        setPage(newPage);
        window?.scrollTo({ top: 0, behavior: "smooth" });
    };

    const paginatedItems = playlistItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div style={playing ? { paddingBottom: 150 } : { paddingBottom: 50 }} className={classes.root}>
            <Container maxWidth="md">
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Paper variant="outlined" className={classes.categoryContainer}>
                            <Avatar className={classes.avatar}>{nameFormat(String(playlistName))}</Avatar>
                            {!editable ? (
                                <Box
                                    textAlign="center"
                                    className={classes.title}
                                    my={3}
                                    fontSize="h6.fontSize"
                                    fontWeight="fontWeightBold"
                                >
                                    {playlistName}
                                </Box>
                            ) : (
                                <TextField
                                    value={playlistName}
                                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                                    label="Playlist Name"
                                    onChange={(e) => setPlaylistName(e.target.value)}
                                    autoFocus
                                    margin="normal"
                                />
                            )}

                            {editable ? (
                                <Box mt={1}>
                                    <Button onClick={handleSave} color="primary" variant="contained" size="small" style={{ marginRight: 8 }}>
                                        Save
                                    </Button>
                                    <Button onClick={handleDelete} color="secondary" variant="outlined" size="small">
                                        Delete
                                    </Button>
                                </Box>
                            ) : (
                                <Box display="flex" mt={1}>
                                    <IconButton onClick={handleEdit} size="small" aria-label="edit playlist">
                                        <CreateIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleShuffle(playlistItems)} size="small" aria-label="shuffle playlist">
                                        <ShuffleIcon />
                                    </IconButton>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        {paginatedItems.map((item) => (
                            <ListItem
                                currentPlayingPosition="playlist"
                                key={item.id}
                                data={item}
                                children={
                                    <Button
                                        variant="contained"
                                        onClick={() => handleRemove(item.id)}
                                        color="secondary"
                                        size="small"
                                    >
                                        <CloseRounded />
                                    </Button>
                                }
                            />
                        ))}

                        {showPagination && (
                            <Box py={2} display="flex" justifyContent="flex-end">
                                <Pagination
                                    onChange={handleChangePage}
                                    size={matches ? "small" : "large"}
                                    page={page}
                                    count={totalPages}
                                    variant="outlined"
                                    shape="rounded"
                                />
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
}