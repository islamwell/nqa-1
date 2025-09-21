import { Box, Container, IconButton, useMediaQuery, useTheme } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import Pagination from "@material-ui/lab/Pagination";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import "swiper/components/pagination/pagination.min.css";
import "swiper/swiper.min.css";
import { Image, ListItem } from "../../components";
import { getCategoryByNameAndSubCategoryNames } from "../../db/services";
import { useData } from "../../hooks/useData";
import { changeFav } from "../../store/slices/favoriteSlice";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: "#f7f7f7",
        minHeight: `calc(100vh - 120px)`,
    },

    image: {
        width: "70%",
        borderRadius: 1000,

        [theme.breakpoints.down("sm")]: {
            width: 100,
            marginRight: theme.spacing(5),
        },
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

const normalizeSubCategoryName = (name) => {
    if (name == null) return undefined;
    try {
        return decodeURIComponent(name).replace(/-/g, ' ');
    } catch (e) {
        return name.replace(/-/g, ' ');
    }
};

export default function Home() {
    const classes = useStyles();
    const params = useParams();
    const theme = useTheme();
    const [categoryDetails, setCategoryDetails] = useState(null);
    const categoryId = categoryDetails?.id;

    const categoryName = params.category ? decodeURIComponent(params.category) : undefined;
    const subCategoryOneName = normalizeSubCategoryName(params.subCategoryOne);
    const subCategoryTwoName = normalizeSubCategoryName(params.subCategoryTwo);
    const subCategoryThreeName = normalizeSubCategoryName(params.subCategoryThree);

    const { offlineMode } = useSelector((state) => state.download);
    const { playing } = useSelector((state) => state.player);

    const matches = useMediaQuery(theme.breakpoints.down("xs"));

    const { loading, totalPages, currentPage, audioList, changePage } = useData({
        offlineMode,
        categoryId,
        shouldSearch: !!categoryDetails,
    });

    const handleChangePage = (_, page) => {
        changePage(page);
    };

    useEffect(() => {
        let details = getCategoryByNameAndSubCategoryNames(categoryName, [subCategoryOneName, subCategoryTwoName, subCategoryThreeName]);
        if (!details && typeof categoryName === 'string') {
            const fallbackName = categoryName.replace(/-/g, ' ');
            details = getCategoryByNameAndSubCategoryNames(fallbackName, [subCategoryOneName, subCategoryTwoName, subCategoryThreeName]);
        }
        setCategoryDetails(details);
    }, [categoryName, subCategoryOneName, subCategoryTwoName, subCategoryThreeName]);

    const showPagination = !loading && audioList.length > 0 && totalPages > 1;

    useEffect(() => {
        window?.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, [currentPage]);



    const dispatch = useDispatch();
    const { favorite } = useSelector((state) => state.favorite);
    const [present, setPresent] = useState(false);

    function handleFavorite(){
        // present?setPresent(false):setPresent(true);
        // console.log("this is the category data***********:",categoryDetails)
            dispatch(
                changeFav({
                  name: categoryDetails.name,
                  link: "category-link",
                  id: categoryDetails.id,
                  image: categoryDetails.image,
                  categoryId: categoryDetails.id,
                })
        )
    }
    useEffect(() => {
        if (favorite.find((item) => item.id === categoryDetails?.id)) {
            setPresent(true);
          } else {
            setPresent(false);
          }
      }, [audioList, favorite,categoryDetails]);

    return (
        <div style={playing ? { paddingBottom: 150 } : { paddingBottom: 50 }} className={classes.root}>
            <Container maxWidth="md">
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Paper variant="outlined" className={classes.categoryContainer}>
                            <Image className={classes.image} src={categoryDetails?.image} alt="cover_image" />
                            <Box
                                textAlign="center"
                                className={classes.title}
                                my={3}
                                fontSize="h6.fontSize"
                                fontWeight="fontWeightBold"
                            >
                                {categoryDetails?.name}
                            </Box>
                                                        <Box className="icon-group" ml={1}>
                                                            <IconButton onClick={handleFavorite}  size="small">
                                                                <FavoriteBorderIcon
                                                                    style={
                                                                        present ? { color: "rgb(240,100,100)" } : { color: "#777" }
                                                                    }
                                                                />
                                                            </IconButton>
                                                        </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        {audioList.map((item) => {
                            return <ListItem currentPlayingPosition="category" key={item.id} data={item} />;
                        })}
                        {showPagination && (
                            <Box py={2} display="flex" justifyContent="flex-end">
                                <Pagination
                                    onChange={handleChangePage}
                                    size={matches ? "small" : "large"}
                                    page={currentPage}
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