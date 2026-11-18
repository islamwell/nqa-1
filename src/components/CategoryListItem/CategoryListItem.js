import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box, IconButton, Paper } from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import { useDispatch, useSelector } from "react-redux";
import { addToDowanloadingQueue } from "../../store/slices/downloadSlice";
import { Image, DynamicAvatar } from "../../components";
const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },

    mainContainer: {
        display: "flex",
        marginBottom: theme.spacing(2),
        borderRadius: 10,
        overflow: "hidden",
    },
    title: {
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
        height: 100,
        width: 100,
        flexShrink: 0,
    },
}));

export default function ListItem({ data }) {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { downloadingIds = [] } = useSelector((state) => state.download || {});

    const { id, name, link, image } = data;

    const handleDownload = () => {
        dispatch(addToDowanloadingQueue({ name, id, link, progress: 0 }));
    };

    const isGenericImage = !image || image.includes("ic_music_node.png");
    const isDownloading = Boolean(downloadingIds && downloadingIds.some((dId) => String(dId) === String(id)));

    return (
        <Paper elevation={0} className={classes.mainContainer}>
            {isGenericImage ? (
                <DynamicAvatar name={name} className={classes.image} />
            ) : (
                <Image src={image} className={classes.image} />
            )}
            <Box pl={2} py={1} display="flex" flexDirection="column" justifyContent="space-between">
                <Box
                    className={classes.title}
                    textAlign="left"
                    fontWeight="fontWeightMedium"
                    fontSize="subtitle2.fontSize"
                >
                    {name}
                </Box>

                <Box display="flex" justifyContent="flex-start">
                    <IconButton
                        disabled={isDownloading}
                        onClick={handleDownload}
                        className={classes.buttonContianer}
                        size="small"
                    >
                        <GetAppIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
        </Paper>
    );
}
