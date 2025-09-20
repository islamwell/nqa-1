import { React, useState, useEffect } from "react";
import "./Favorite.css";
import { Box, IconButton } from "@material-ui/core";
import Image from "../Image";
import { makeStyles } from "@material-ui/core/styles";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import { changeURL } from "../../store/slices/playerSlice";
import { changeFav } from "../../store/slices/favoriteSlice";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { navigateToCategory } from "../../helpers/navigateToCategory";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    borderRadius: 10,
    // maxHeight: 400,

    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(5),
    },

    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(3),
    },
  },

  itemContainer: {
    cursor: "pointer",
    display: "flex",
    width: "100%",
  },

  itemContainerCategory: {
    cursor: "pointer",
    display: "flex",
    width: "100%",
    backgroundColor: "#17999270",
  },

  image: {
    height: 50,
    width: 50,
    borderRadius: 30,
  },
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
}));

function Favorite() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { favorite } = useSelector((state) => state.favorite);
  const history = useHistory();
  const handlePlay = (name, link, id, image, categoryId) => {
    dispatch(
      changeURL({
        name,
        link,
        id,
        image,
        categoryId,
        currentPlayingPosition: "home",
      })
    );
  };
  const handleFavorite = (name, link, id, image, categoryId) => {
    dispatch(
      changeFav({
        name,
        link,
        id,
        image,
        categoryId,
        currentPlayingPosition: "home",
      })
    );
  };

  const itemsPerPage = 5;
  const [page, setPage] = useState(1);
  const noOfPages = Math.max(1, Math.ceil(favorite.length / itemsPerPage));
  const showPagination = noOfPages > 1;

  useEffect(() => {
    const newNoOfPages = Math.max(1, Math.ceil(favorite.length / itemsPerPage));
    if (page > newNoOfPages) {
      setPage(newNoOfPages);
    }
    if (favorite.length > 0 && page < 1) {
      setPage(1);
    }
  }, [favorite.length, page, itemsPerPage]);

  return (
    <div className="favorite-container">
      {favorite.length === 0 && (
        <Box display="flex" justifyContent="center" alignItems="center" my={10}>
          No favorite audios...
        </Box>
      )}
      {favorite
        .slice()
        .reverse()
        .slice((page - 1) * itemsPerPage, page * itemsPerPage)
        .map((item, key) => (
          <Box
            className={item.link === "category-link" ? classes.itemContainerCategory :classes.itemContainer}
            display="flex"
            alignItems="center"
            paddingTop={1}
            paddingBottom={1}
            key={key}
          >
            <Image src={item.image} className={classes.image} />

            <Box
              onClick={() => {
                if (item.link !== "category-link") {
                  return handlePlay(
                    item.name,
                    item.link,
                    item.id,
                    item.image,
                    item.categoryId
                  );
                }
              }}
              className="fav-name-container"
              marginLeft={2}
              fontWeight="fontWeightMedium"
              fontSize="body2.fontSize"
            >
              <p
                onClick={() => {
                  if (item.link === "category-link") {
                    navigateToCategory(item.id, history);
                  }
                }}
              >
                {" "}
                {item.name}
              </p>
            </Box>
            <IconButton
              onClick={() =>
                handleFavorite(
                  item.name,
                  item.link,
                  item.id,
                  item.image,
                  item.categoryId
                )
              }
              className="fav-icon-container"
              size="small"
            >
              <FavoriteBorderIcon />
            </IconButton>
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
    </div>
  );
}

export default Favorite;
