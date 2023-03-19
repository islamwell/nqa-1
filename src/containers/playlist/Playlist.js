import { Avatar, Box, Grid, Paper, makeStyles } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import Image from '../../components/Image/Image';

const useStyles = makeStyles((theme) => ({
    title: {
        color: "rgb(16, 107, 102)",
    },

    recentContainer: {
        padding: theme.spacing(3),
        borderRadius: 10,
    },
    item: {
        cursor: 'pointer'
    },
    image: {
        height: 150,
        width: 150,
    },
    playlistContainer: {
        padding: 10
    }
}));

export default function Playlist() {
    const classes = useStyles();
    const history = useHistory();
    const [data, setData] = useState([]);

    useEffect(() => {
        const payloads = JSON.parse(localStorage.getItem('playlist'));
        if (payloads && payloads?.length > 0) {
            setData(payloads)
        }
    }, []);

    return (
        <div className="fav-redirect-container">
            <Grid item xs={12} lg={6}>
                <Box
                    className={classes.title}
                    mb={3}
                    fontSize="h4.fontSize"
                    fontWeight="fontWeightBold"
                >
                    Playlists
                </Box>
                <Grid container spacing={4} className="playlist-container">
                    {
                        data.map((item, key) => {
                            return (
                                <Grid item className={classes.item} key={'playlist-' + key} onClick={() => history.push('/playlist/detail', {
                                    item, index: key
                                })} xs={6} lg={3} sm={6} md={4}>
                                    <Paper variant="outlined" className={classes.playlistContainer}>
                                        <Box display={'flex'} justifyContent={'center'}>
                                            <Avatar className={classes.image}>{(Object.keys(item)[0].split('')[0]).toUpperCase()}</Avatar>
                                        </Box>
                                        <Box textAlign="center" textOverflow="ellipsis" overflow="hidden" py={1} fontSize={12}>
                                            {Object.keys(item)[0]}
                                        </Box>
                                    </Paper>
                                </Grid>)
                        })
                    }
                </Grid>
            </Grid>
            {/* <Grid item xs={12} md={4}>
              <Box
                  className={classes.title}
                  mb={3}
                  fontSize="h4.fontSize"
                  fontWeight="fontWeightBold"
              >
                  Cached
              </Box>
              <Cache />
          </Grid> */}
        </div>
    )
}
