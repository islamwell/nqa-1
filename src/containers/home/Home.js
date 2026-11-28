/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { fade, makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Box, Button, Container, useTheme } from "@material-ui/core";
import { ListItem, RecentlyPlayed } from "../../components";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import "swiper/swiper.min.css";
import "swiper/components/pagination/pagination.min.css";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import NewReleasesRoundedIcon from "@material-ui/icons/NewReleasesRounded";
import HistoryRoundedIcon from "@material-ui/icons/HistoryRounded";
import FavoriteRoundedIcon from "@material-ui/icons/FavoriteRounded";

import Pagination from "@material-ui/lab/Pagination";
import { useData } from "../../hooks/useData";

import "./style.css";
import { fetchTopChart } from "../../store/slices/playerSlice";
import { changeSubCatsVisible } from "../../store/slices/favoriteSlice";
import Favorite from "../../components/Favorite/Favorite";
import SectionHeader from "../../components/SectionHeader";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    minHeight: `calc(100vh - 120px)`,
    padding: theme.spacing(2, 0, 10, 0),
    [theme.breakpoints.down("xs")]: {
      paddingTop: theme.spacing(1),
    },
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(4),
  },
  pagination: {
    "& .MuiPaginationItem-root": {
      borderRadius: 10,
      fontWeight: 600,
      backgroundColor: theme.palette.background.paper,
      borderColor: fade(theme.palette.primary.main, 0.2),
    },
    "& .Mui-selected": {
      color: theme.palette.primary.contrastText,
      backgroundColor: `${theme.palette.primary.main} !important`,
      borderColor: theme.palette.primary.main,
    },
  },
  viewAll: {
    flexShrink: 0,
    borderRadius: 999,
    textTransform: "none",
    fontWeight: 600,
  },
}));

export default function Home() {
  const classes = useStyles();
  const theme = useTheme();
  const dispatch = useDispatch();
  const history = useHistory();

  const { offlineMode } = useSelector((state) => state.download);
  const { playing } = useSelector((state) => state.player);
  const { favorite } = useSelector((state) => state.favorite);

  const { loading, totalPages, currentPage, audioList, changePage } = useData({ offlineMode });
  const handleChangePage = (_, page) => {
    changePage(page);
  };

  const showPagination = (!loading && audioList.length > 0) || totalPages > 1;
  const matches = useMediaQuery(theme.breakpoints.down("xs"));

  useEffect(() => {
    dispatch(fetchTopChart(1));
  }, []);

  useEffect(() => {
    window?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentPage]);

  const openFavorites = () => {
    dispatch(changeSubCatsVisible({ subCatsVisible: false }));
    history.push("/favorites");
  };

  return (
    <div style={playing ? { paddingBottom: 150 } : { paddingBottom: 50 }} className={classes.root}>
      <Container maxWidth="md">
        <Grid container spacing={matches ? 2 : 4}>
          <Grid item xs={12} md={8}>
            <SectionHeader
              icon={<NewReleasesRoundedIcon />}
              title="Recently Added"
              subtitle="The newest lectures, freshly uploaded"
            />
            {audioList.map((item, key) => {
              return <ListItem currentPlayingPosition="home" key={key} data={item} />;
            })}
            {showPagination && (
              <Box py={2} display="flex" justifyContent={matches ? "center" : "flex-end"}>
                <Pagination
                  className={classes.pagination}
                  onChange={handleChangePage}
                  page={currentPage}
                  count={totalPages}
                  size={matches ? "small" : "large"}
                  variant="outlined"
                  shape="rounded"
                />
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={4} className={classes.sidebar}>
            <div>
              <SectionHeader icon={<HistoryRoundedIcon />} title="History" subtitle="Pick up where you left off" />
              <RecentlyPlayed />
            </div>
            <div>
              <SectionHeader
                icon={<FavoriteRoundedIcon />}
                title="Favorites"
                subtitle="Lectures you saved"
                action={
                  favorite.length > 0 && (
                    <Button size="small" color="primary" className={classes.viewAll} onClick={openFavorites}>
                      View all
                    </Button>
                  )
                }
              />
              <Favorite />
            </div>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
