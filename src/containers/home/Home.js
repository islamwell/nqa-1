/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Box, Container, Paper, useTheme } from "@material-ui/core";
import { ListItem, RecentlyPlayed } from "../../components";
import { useSelector } from "react-redux";
import "swiper/swiper.min.css";
import "swiper/components/pagination/pagination.min.css";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import Pagination from "@material-ui/lab/Pagination";
import { useData } from "../../hooks/useData";

import "./style.css"; // this style for the topchat
import Favorite from "../../components/Favorite/Favorite";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: "transparent",
    minHeight: `calc(100vh - 120px)`,
    padding: theme.spacing(4, 0, 10, 0),
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },

  title: {
    color: theme.palette.primary.dark,
  },

  recentContainer: {
    padding: theme.spacing(3),
    borderRadius: 16,
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
  },

  panel: {
    padding: theme.spacing(3),
    borderRadius: 16,
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#e0f2f1",
  },
}));

export default function Home() {
  const classes = useStyles();
  const theme = useTheme();
  const { offlineMode } = useSelector((state) => state.download);
  let { playing } = useSelector((state) => state.player);

  const { loading, totalPages, currentPage, audioList, changePage } = useData({ offlineMode: offlineMode });
  const handleChangePage = (_, page) => {
    changePage(page);
  };

  const showPagination = (!loading && audioList.length > 0) || totalPages > 1;
  const matches = useMediaQuery(theme.breakpoints.down("xs"));


  useEffect(() => {
    window?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentPage]);

  
  return (
    <div style={playing ? { paddingBottom: 150 } : { paddingBottom: 50 }} className={classes.root}>
      <Container maxWidth="lg" >
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={0} className={classes.panel}>
              <Box className={classes.sectionHeader} mb={2} fontSize="h4.fontSize" fontWeight="fontWeightBold">
                Recently Added
              </Box>
              {audioList.map((item, key) => {
                return <ListItem currentPlayingPosition="home" key={key} data={item} />;
              })}
              {showPagination && (
                <Box py={2} display="flex" justifyContent="flex-end">
                  <Pagination
                    onChange={handleChangePage}
                    page={currentPage}
                    count={totalPages}
                    size={matches ? "small" : "large"}
                    variant="outlined"
                    shape="rounded"
                  />
                </Box>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} className={classes.panel}>
              <Box className={classes.sectionHeader} mb={3} fontSize="h5.fontSize" fontWeight="fontWeightBold">
                History
              </Box>

              <RecentlyPlayed />
            </Paper>
            <Box mt={3}>
              <Paper elevation={0} className={classes.panel}>
                <Box className={classes.sectionHeader} mb={3} fontSize="h5.fontSize" fontWeight="fontWeightBold">
                  Favorites
                </Box>
                <Favorite />
              </Paper>
            </Box>

        </Grid>
          </Grid>
      </Container>
    </div>
  );
}
