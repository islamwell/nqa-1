import React from "react";
import { Box, Typography } from "@material-ui/core";
import { fade, makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    margin: theme.spacing(0, 0, 2, 0),
  },
  icon: {
    flexShrink: 0,
    width: 40,
    height: 40,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.primary.contrastText,
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    boxShadow: `0 6px 14px ${fade(theme.palette.primary.main, 0.3)}`,
    "& svg": {
      fontSize: 22,
    },
    [theme.breakpoints.down("xs")]: {
      width: 34,
      height: 34,
      borderRadius: 10,
      "& svg": {
        fontSize: 19,
      },
    },
  },
  text: {
    flexGrow: 1,
    minWidth: 0,
  },
  title: {
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
    color: theme.palette.primary.dark,
    fontSize: "1.6rem",
    [theme.breakpoints.down("xs")]: {
      fontSize: "1.3rem",
    },
  },
  subtitle: {
    color: fade(theme.palette.text.primary, 0.65),
    marginTop: 2,
  },
}));

// Shared heading for the front page sections: icon tile, title, optional subtitle and action.
export default function SectionHeader({ icon, title, subtitle, action, className, ...rest }) {
  const classes = useStyles();
  return (
    <Box className={`${classes.root} ${className || ""}`} {...rest}>
      {icon && (
        <span className={classes.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <div className={classes.text}>
        <Typography component="h2" className={classes.title}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" className={classes.subtitle}>
            {subtitle}
          </Typography>
        )}
      </div>
      {action}
    </Box>
  );
}
