import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Container, Paper, makeStyles } from "@material-ui/core";
import React from "react";
import TopBar from "../topBar";
import Player from "../player";
import CategorySlider from "../../components/TopChart/CategorySlider";

const useStyles = makeStyles((theme) => ({
    shell: {
        minHeight: "100vh",
        background: "radial-gradient(circle at 20% 20%, rgba(20,184,166,0.18), transparent 35%), radial-gradient(circle at 80% 10%, rgba(14,165,233,0.16), transparent 30%), linear-gradient(180deg, #0b1224 0%, #0c1d2c 45%, #0b1724 100%)",
        color: "#e2e8f0",
    },
    content: {
        position: "relative",
        paddingBottom: theme.spacing(10),
    },
    sliderPanel: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(1.5, 2),
        borderRadius: 18,
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        boxShadow: "0 15px 50px rgba(0,0,0,0.25)",
        backdropFilter: "blur(8px)",
    },
}));

export default function Layout({ children }) {
    const classes = useStyles();
    return (
        <div className={classes.shell}>
            <TopBar/>
            <Container maxWidth="lg" className={classes.content}>
                <Paper elevation={0} className={classes.sliderPanel}>
                  <CategorySlider/>
                </Paper>
                <div id="app-main-content">
                    {children}
                    <Player />
                </div>
            </Container>
            <ToastContainer autoClose={1000} className="notification-container-copied" />
        </div>
    );
}
