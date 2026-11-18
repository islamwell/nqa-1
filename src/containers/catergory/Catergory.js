import { Box, Container, IconButton } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import { useEffect, useState, useRef } from "react";
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
        backgroundColor: theme.palette.background.default,
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
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },

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
        return decodeURIComponent(name)
            .toString()
            .normalize()
            .replace(/\u00A0/g, ' ')
            .replace(/[\s_-]+/g, ' ')
            .trim();
    } catch (e) {
        return name.toString()
            .normalize()
            .replace(/\u00A0/g, ' ')
            .replace(/[\s_-]+/g, ' ')
            .trim();
    }
};

export default function Home() {
    const classes = useStyles();
    const params = useParams();
    const [categoryDetails, setCategoryDetails] = useState(null);
    const categoryId = categoryDetails?.id;

    let categoryName = undefined;
    if (params.category) {
        try {
            categoryName = decodeURIComponent(params.category);
        } catch (_) {
            categoryName = params.category;
        }
    }

    const subCategoryNames = [
        params.subCategoryOne,
        params.subCategoryTwo,
        params.subCategoryThree,
        params.subCategoryFour,
        params.subCategoryFive,
    ]
        .filter(Boolean)
        .map(normalizeSubCategoryName);

    const subCategoryNamesKey = JSON.stringify(subCategoryNames);

    const { offlineMode } = useSelector((state) => state.download);
    const { playing } = useSelector((state) => state.player);

    const { loading, totalPages, currentPage, audioList, changePage } = useData({
        offlineMode,
        categoryId,
        shouldSearch: !!categoryDetails,
        append: true,
    });

    useEffect(() => {
        let details = getCategoryByNameAndSubCategoryNames(categoryName, subCategoryNames);
        if (!details && typeof categoryName === 'string') {
            const fallbackName = categoryName.replace(/-/g, ' ');
            details = getCategoryByNameAndSubCategoryNames(fallbackName, subCategoryNames);
        }
        setCategoryDetails(details);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryName, subCategoryNamesKey]);

    const showPagination = !loading && audioList.length > 0 && totalPages > 1;

    const loaderRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && showPagination && currentPage < totalPages) {
                changePage(currentPage + 1);
            }
        });
        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [currentPage, showPagination, changePage, totalPages]);

    const dispatch = useDispatch();
    const { favorite = [] } = useSelector((state) => state.favorite || {});
    const [present, setPresent] = useState(false);

    function handleFavorite() {
        if (!categoryDetails) return;
        dispatch(
            changeFav({
                name: categoryDetails.name,
                link: "category-link",
                id: categoryDetails.id,
                image: categoryDetails.image,
                categoryId: categoryDetails.id,
            })
        );
    }

    useEffect(() => {
        if (categoryDetails && favorite.some((item) => String(item.id) === String(categoryDetails.id))) {
            setPresent(true);
        } else {
            setPresent(false);
        }
    }, [favorite, categoryDetails]);

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
                                                                        color={!present ? "action" : "inherit"}
                                                                        style={
                                                                            present ? { color: "rgb(240,100,100)" } : { color: undefined }
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
                            <Box py={2} display="flex" justifyContent="center" ref={loaderRef}>
                                Loading more...
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
}