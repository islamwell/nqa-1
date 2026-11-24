import React from "react";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import { makeStyles } from "@material-ui/core/styles";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
    },
    paper: {
        marginRight: theme.spacing(2),
    },

    buttonLebel: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        fontSize: 14,
        alignItems: "center",
    },

    button: {
        paddingRight: theme.spacing(1),
    },
}));

export default function SubMenu({ children, label, onSelect }) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);
    const closeTimerRef = React.useRef(null);

    const clearCloseTimer = () => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };

    const handleMouseEnter = () => {
        clearCloseTimer();
        setOpen(true);
    };

    const handleMouseLeave = () => {
        clearCloseTimer();
        closeTimerRef.current = setTimeout(() => {
            setOpen(false);
        }, 150);
    };

    React.useEffect(() => {
        return () => clearCloseTimer();
    }, []);

    const handleItemClick = () => {
        if (open && onSelect) {
            onSelect();
            setOpen(false);
            return;
        }
        setOpen((prevOpen) => !prevOpen);
    };

    const handleChevronClick = (event) => {
        event.stopPropagation();
        setOpen((prevOpen) => !prevOpen);
    };

    function handleListKeyDown(event) {
        if (event.key === "Tab") {
            event.preventDefault();
            setOpen(false);
        }
    }

    return (
        <div className={classes.root}>
            <div style={{ width: "100%" }}>
                <MenuItem
                    className={classes.button}
                    ref={anchorRef}
                    onClick={handleItemClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className={classes.buttonLebel}>
                        <span>{label}</span>
                        <ChevronRightIcon onClick={handleChevronClick} />
                    </div>
                </MenuItem>

                <Popper
                    placement="right-start"
                    open={open}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    transition
                    style={{ zIndex: 1300 }}
                >
                    {({ TransitionProps }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin: "top left",
                            }}
                            timeout={200}
                        >
                            <Paper
                                data-dropdown-menu="true"
                                style={{ marginLeft: 2, maxHeight: "75vh", overflowY: "auto" }}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                <MenuList autoFocusItem={false} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                                    {children}
                                </MenuList>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </div>
        </div>
    );
}
