import React, { useEffect, useRef, useState } from "react";
import { Box, Grid, Paper, Breadcrumbs, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { fade } from "@material-ui/core/styles/colorManipulator";
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
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
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
      width: 120,
    },
  },

  catLink: {
    cursor: "pointer",
    color: theme.palette.text.primary,
    padding: theme.spacing(0),
    overflow: "hidden",
    textOverflow: "ellipses",
    fontWeight: "bold",
    [theme.breakpoints.down("xs")]: {
      width: "auto",
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
  sliderWrapper: {
    position: "relative",
    '& .slick-prev, & .slick-next': {
      zIndex: 5,
      width: 36,
      height: 36,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: fade(theme.palette.primary.main, 0.75),
    },
    '& .slick-prev:before, & .slick-next:before': {
      display: 'none',
    },
    '& .slick-prev': { left: 8 },
    '& .slick-next': { right: 8 },
  },
  navZone: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "52px",
    zIndex: 3,
    cursor: "pointer",
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: fade(theme.palette.primary.main, 0.08),
    },
  },
  navZoneHover: {
    backgroundColor: fade(theme.palette.primary.main, 0.12),
  },
  navLeft: {
    left: 0,
  },
  navRight: {
    right: 0,
  },
  arrowRoot: {
    zIndex: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: fade(theme.palette.primary.main, 0.9),
    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
    transition: 'background 120ms ease, transform 120ms ease',
    '&:hover': {
      background: theme.palette.primary.dark,
    },
    '&$arrowHover': {
      background: theme.palette.primary.dark
    },
    '&$arrowHover $arrowIcon': {
      color: theme.palette.getContrastText(theme.palette.primary.dark)
    }
  },
  arrowHover: {},
  arrowIcon: {
    color: theme.palette.getContrastText(theme.palette.primary.main),
    fontSize: 28,
    transition: 'color 120ms ease',
    '$arrowRoot:hover &': {
      color: theme.palette.getContrastText(theme.palette.primary.dark),
    }
  }
}));



const CustomArrow = ({ className, onClick, direction, onHover, isHovered, onManualInteraction }) => {
  const classes = useStyles();
  return (
    <div
      className={`${className} ${classes.arrowRoot} ${isHovered ? classes.arrowHover : ''}`}
      onClick={onClick}
      role="button"
      aria-label={direction === 'left' ? 'Previous' : 'Next'}
      onMouseEnter={() => onHover && onHover(true)}
      onMouseLeave={() => onHover && onHover(false)}
      onMouseDown={() => onManualInteraction && onManualInteraction()}
    >
      {direction === 'left' ? (
        <ChevronLeftIcon className={classes.arrowIcon} />
      ) : (
        <ChevronRightIcon className={classes.arrowIcon} />
      )}
    </div>
  );
};

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
  const sliderRef = useRef(null);
  const draggingRef = useRef(false);
  const [hoveredArrow, setHoveredArrow] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(2000);


  const handleManualInteraction = () => {
    if (sliderRef && sliderRef.current && sliderRef.current.slickPause) {
      sliderRef.current.slickPause();
    }
    setCurrentSpeed(500);
  };

  let settings = {
    dots: false,
    infinite: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <CustomArrow direction="left" onHover={(isHover) => setHoveredArrow(isHover ? 'left' : null)} isHovered={hoveredArrow === 'left'} onManualInteraction={handleManualInteraction} />,
    nextArrow: <CustomArrow direction="right" onHover={(isHover) => setHoveredArrow(isHover ? 'right' : null)} isHovered={hoveredArrow === 'right'} onManualInteraction={handleManualInteraction} />,
    autoplay: true,
    speed: currentSpeed,
    swipe: true,
    swipeToSlide: true,
    draggable: true,
    touchMove: true,
    touchThreshold: 15,
    edgeFriction: 0.05,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: false,
          touchThreshold: 15,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
          initialSlide: 2,
          touchThreshold: 15,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          touchThreshold: 15,
        }
      }
    ],
    autoplaySpeed: 2000,
    cssEase: "linear",
    beforeChange: () => {
      draggingRef.current = true;
    },
    afterChange: () => {
      setTimeout(() => {
        draggingRef.current = false;
      }, 80);
      setCurrentSpeed(2000);
    },
    onSwipe: () => {
      draggingRef.current = true;
    },
    
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
        <div className={classes.sliderWrapper}>
          {/* Wide, full-height click zones for easy navigation */}
          <div
            className={`${classes.navZone} ${classes.navLeft} ${hoveredArrow === 'left' ? classes.navZoneHover : ''}`}
            onMouseEnter={() => setHoveredArrow('left')}
            onMouseLeave={() => setHoveredArrow(null)}
            onClick={(e) => {
              e.stopPropagation();
              handleManualInteraction();
              if (sliderRef.current) {
                sliderRef.current.slickPrev();
              }
            }}
          />
          <div
            className={`${classes.navZone} ${classes.navRight} ${hoveredArrow === 'right' ? classes.navZoneHover : ''}`}
            onMouseEnter={() => setHoveredArrow('right')}
            onMouseLeave={() => setHoveredArrow(null)}
            onClick={(e) => {
              e.stopPropagation();
              handleManualInteraction();
              if (sliderRef.current) {
                sliderRef.current.slickNext();
              }
            }}
          />

          <Slider ref={sliderRef} {...settings}>
          {
            categoryStructure.map((item) => (
              <div className={classes.item} key={item.id}>
                <Box>
                  <Image 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (draggingRef.current) return;
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
