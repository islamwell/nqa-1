import React, { useEffect, useState } from "react";
import { Box, Grid, Paper, Breadcrumbs, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import Image from "../Image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import categoryStructure from "../../data/category-strcture";
import { slugifyLower } from "../../utils";
import { useHistory, useLocation } from "react-router-dom";
import { navigateToCategory } from "../../helpers/navigateToCategory";
import Home from "@material-ui/icons/Home";
import { changeSubCatsVisible } from "../../store/slices/favoriteSlice";



const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(2),

    [theme.breakpoints.down("xs")]: {
      marginBottom: theme.spacing(0),
    },
  },
  paper: {
    padding: theme.spacing(2),
    minWidth: 850,
    textAlign: "center",
    color: theme.palette.text.secondary,
  },

  image: {
    boxShadow: "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
    borderRadius: 15,
    width: 150,
    height: 150,

    [theme.breakpoints.down("xs")]: {
      width: 100,
      height: 100,
    },
  },

  title: {
    color: theme.palette.primary.dark,
  },

  item: {
    cursor: "pointer",
    width: 150,
    fontSize: theme.typography.fontSize,
    padding: theme.spacing(0),
    [theme.breakpoints.down("xs")]: {
      width: 10,
    },
  },

  catLink: {
    cursor: "pointer",
    color: "black",
    padding: theme.spacing(0),
    overflow: "hidden",
    textOverflow: "ellipses",
    fontWeight: "bold",
    [theme.breakpoints.down("xs")]: {
      width: 10,
    },
  },
  categoryContainer: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "center",
    borderRadius: 10,

},
}));



export default function CategorySlider({ data, getMore }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [subCategories, setSubCategories] = useState([]);
  const [currCategory, setCurrCategory] = useState({});
  const [currSubCategory, setCurrSubCategory] = useState({});
  const [history, setHistory] = useState([{id: 0, name: "Home"}]);
  const browserHistory = useHistory();
  const { pathname } = useLocation();
  const [isSubCatVisible, setIsSubCatVisible] = useState(true);
  const {subCatsVisible} = useSelector((state) => state.favorite);


  let settings = {
    dots: false,
    infinite: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    speed: 2500,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: false
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      }
    ],
    autoplaySpeed: 2000,
    cssEase: "linear",
    
  };

  useEffect(() => {
    if (currCategory && currCategory.subCategories) {
      setSubCategories(currCategory.subCategories);
      setCurrSubCategory({});
    } else {
      setSubCategories([]);
    }
  }, [currCategory])

  useEffect(() => {
  const path = pathname || '';
  if (!path.startsWith('/category/')) return;

  const raw = path.replace('/category/', '');
    if (!raw) return;

    const segments = raw.split('/').filter(Boolean);


    const matched = [];
    let candidates = categoryStructure;

    for (let seg of segments) {
      if (!candidates || candidates.length === 0) break;
      const segSlug = seg.toLowerCase();
  let found = candidates.find((c) => slugifyLower(c.name) === segSlug);
      if (!found) {
        found = candidates.find((c) => String(c.id) === seg);
      }
      if (!found) break;
      matched.push(found);
      candidates = found.subCategories || [];
    }

    if (matched.length > 0) {
      const hist = [{ id: 0, name: 'Home' }, ...matched];
      setHistory(hist);
      const last = matched[matched.length - 1];
      setSubCategories(last.subCategories || []);
      setCurrCategory(matched[0] || {});
      if (matched.length > 1) setCurrSubCategory(matched[matched.length - 1] || {});
      dispatch(
        changeSubCatsVisible({
          subCatsVisible: true,
        })
      );
    }
  }, [pathname, dispatch]);

  var subCatOnClick = (item) => {
    if (item.id === currSubCategory.id) {
      return;
    }
    setHistory((prev) => {
      if (prev.find((h) => h.id === item.id)) return prev;
      return [...prev, item];
    });

    if (item.subCategories) {
      setCurrSubCategory(item);
      setSubCategories(item.subCategories);
      navigateToCategory(item.id, browserHistory);
    } else {
      setCurrSubCategory(item);
      handleSelectCategory(item);
    }
    !isSubCatVisible && setIsSubCatVisible(true);
  };

  var handleHistoryClick = (item) => {
    if (item.id === 0) {
      setCurrCategory({});
      setSubCategories([]);
      setCurrSubCategory({});
      setHistory([{ id: 0, name: "Home" }]);
      browserHistory.push('/');
    } else {
      navigateToCategory(item.id, browserHistory);
    }
    !isSubCatVisible && setIsSubCatVisible(true);
  };

  const handleSelectCategory = ({ id }) => {
    setIsSubCatVisible(false);
    navigateToCategory(id, browserHistory);
  };

  

  return (
    <div className={classes.root}>
      <Box className={classes.title} my={2} ml={1} fontSize="h4.fontSize" fontWeight="fontWeightBold">
        Categories
      </Box>
      <div onClick={getMore} >
        <Slider 
          
        {...settings}>
          {
            categoryStructure.map((item) => (
              <div className={classes.item} key={item.id}>
                <Box>
                  <Image 
                    onClick={() => {
                      dispatch(
                        changeSubCatsVisible({
                          subCatsVisible: true
                        })
                      )
                      setCurrCategory(item)
                      !isSubCatVisible && setIsSubCatVisible(true)
                      navigateToCategory(item.id, browserHistory);
                    }} 
                    src={item.image} className={classes.image}/>
                </Box>
                <Box textAlign="center" textOverflow="ellipsis" overflow="hidden" py={1} fontSize={12}>
                  {item.name}
                </Box>
              </div>
            ))
          }
          </Slider>
          </div>
      {
        (history.length > 1 || subCategories.length > 0) && subCatsVisible?
        <>
        <Box className={classes.title} my={3} ml={1} fontSize="h4.fontSize" fontWeight="fontWeightBold">
            <Breadcrumbs >
              {
                history.map((item, idx) => (
                  <span key={`history-${item.id}`}>
                    {/* {idx !== 0 ? ">" : ""} */}
                    
                    <Link
                      className={classes.catLink}
                      onClick={
                        idx !== history.length - 1
                          ? () => handleHistoryClick(item)
                          : () => {}
                      }
                      textOverflow="ellipsis"
                      overflow="hidden"
                    >
                      {idx === 0 ? <Home /> : item.name}
                    </Link>

                  </span>
                ))
              }
            </Breadcrumbs>
          
        </Box>
        {
          isSubCatVisible &&
      <Box mb={2}>
        {/* <Slider  */}
          <Grid container spacing={2}>

          {/* {...settings} */}
            {
              subCategories.map((item) => (
                <Grid item className={classes.item} key={item.id} xs= {6} lg={3} sm={6} md={4}>
                  <Paper variant="outlined" className={classes.categoryContainer}>
                      <Box>
                        <Image  onClick={() => subCatOnClick(item)} src={item.image} className={classes.image}/>
                      </Box>
                      <Box textAlign="center" textOverflow="ellipsis" overflow="hidden" py={1} fontSize={12}>
                        {item.name}
                      </Box>
                  </Paper>
                </Grid>
              ))
            }
          </Grid>
          
          {/* </Slider> */}
          </Box>
        }
        </> : <></>
      }
      
    </div>

  );
}
