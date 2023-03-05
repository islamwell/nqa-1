import { Box, Button, Dialog, DialogTitle, TextField } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import Image from '../Image/Image';

export default function DialogBox({ open, handleClose, title, data }) {
    const [playlistName, setPlaylistName] = useState('')
    const [handleError, setHandleError] = useState({
        error: false,
        message: ''
    })
    const addSongToPlaylist = () => {
        if (playlistName.length < 1) {
            return setHandleError({
                error: true,
                message: 'Kindly enter the name first'

            })
        }

        setHandleError({
            error: false,
            message: ''

        })

        let localData = JSON.parse(localStorage.getItem('playlist')) || [];
        
        if (localData.find(item => item[playlistName])) {
            localData.find(item => item[playlistName])[playlistName].push(data)
            localStorage.setItem('playlist', JSON.stringify(localData))
        } else {
            localData.push({ [playlistName]: [data] })
            localStorage.setItem('playlist', JSON.stringify(localData))
        }

        console.log('[localData]', localData)

    }

    useEffect(() => () => {
        setPlaylistName('');
        setHandleError({
            error: false,
            message: ''
        })
    }, [open]);

    return (
        <Dialog onClose={handleClose} open={open} fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <Image src={data?.image} />
            <Box as="p" textAlign={'center'} paddingTop={3}>{data?.name}</Box>
            <Box margin={2}>
                <TextField label="Playlist" fullWidth value={playlistName} error={handleError.error} helperText={handleError.message} onChange={(event) => setPlaylistName(event.target.value)} />
            </Box>
            <Box gap={2} margin={2} marginY={2}>
                <Button fullWidth variant="contained" color="primary" onClick={addSongToPlaylist}>Save</Button>
                <Button fullWidth variant="text" onClick={handleClose}>Cancel</Button>
            </Box>

        </Dialog>
    )
}
