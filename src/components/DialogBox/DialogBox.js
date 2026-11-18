import { Box, Button, Dialog, DialogTitle, InputLabel, MenuItem, Select, TextField } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import Image from "../Image/Image";
import { toast } from "react-toastify";

export default function DialogBox({ open = false, handleClose, title, data }) {
    const [playlistName, setPlaylistName] = useState("");
    const [options, setOptions] = useState([]);
    const [handleError, setHandleError] = useState({
        error: false,
        message: "",
    });

    const addSongToPlaylist = () => {
        const cleanName = String(playlistName).trim();
        if (cleanName.length < 1) {
            return setHandleError({
                error: true,
                message: "Kindly enter or select a playlist name",
            });
        }

        setHandleError({
            error: false,
            message: "",
        });

        let localData = [];
        try {
            localData = JSON.parse(localStorage.getItem("playlist")) || [];
        } catch (_) {
            localData = [];
        }

        const existingPlaylist = localData.find((item) => item[cleanName]);

        if (existingPlaylist) {
            const alreadyExists = (existingPlaylist[cleanName] || []).some(
                (song) => String(song.id) === String(data?.id)
            );
            if (alreadyExists) {
                toast.info("Audio already exists in this playlist");
                return handleClose();
            }
            existingPlaylist[cleanName].push(data);
        } else {
            localData.push({ [cleanName]: [data] });
        }

        localStorage.setItem("playlist", JSON.stringify(localData));
        handleClose();
        toast.success("Added to playlist");
    };

    useEffect(() => {
        if (!open) {
            setPlaylistName("");
            setHandleError({
                error: false,
                message: "",
            });
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            try {
                const localData = JSON.parse(localStorage.getItem("playlist")) || [];
                const keys = localData.map((item) => Object.keys(item)[0]).filter(Boolean);
                setOptions(keys);
            } catch (_) {
                setOptions([]);
            }
        }
    }, [open]);

    const keyPressHandler = (e) => {
        if (e.key === "Enter") {
            addSongToPlaylist();
        }
    };

    return (
        <Dialog onClose={handleClose} open={open} fullWidth maxWidth="xs">
            <DialogTitle>{title}</DialogTitle>
            {data?.image && (
                <Box display="flex" justifyContent="center">
                    <Image src={data?.image} style={{ width: 80, height: 80, borderRadius: 8 }} />
                </Box>
            )}
            <Box as="p" textAlign="center" pt={2} px={2} fontWeight="fontWeightMedium">
                {data?.name}
            </Box>
            <Box mx={3} my={1}>
                <TextField
                    label="Playlist Name"
                    fullWidth
                    value={playlistName}
                    onKeyPress={keyPressHandler}
                    error={handleError.error}
                    helperText={handleError.message}
                    onChange={(event) => setPlaylistName(event.target.value)}
                />
            </Box>
            {options.length > 0 && (
                <Box mx={3} my={1}>
                    <InputLabel id="select-playlist-label">Or choose existing</InputLabel>
                    <Select
                        labelId="select-playlist-label"
                        fullWidth
                        value={options.includes(playlistName) ? playlistName : ""}
                        onChange={(event) => setPlaylistName(event.target.value)}
                    >
                        <MenuItem value="">
                            <em>Select an existing playlist</em>
                        </MenuItem>
                        {options.map((item, index) => (
                            <MenuItem value={item} key={`option--${index}`}>
                                {item}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            )}
            <Box display="flex" gap={2} mx={3} my={2}>
                <Button fullWidth variant="contained" color="primary" onClick={addSongToPlaylist}>
                    Save
                </Button>
                <Button fullWidth variant="text" onClick={handleClose}>
                    Cancel
                </Button>
            </Box>
        </Dialog>
    );
}
