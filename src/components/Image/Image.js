import Cover from "../../assets/image.png";

import React, { useEffect, useState } from "react";
import { useTheme } from "@material-ui/core/styles";

export default function Image({ src, ...rest }) {
    const theme = useTheme();
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        if (!src) {
            setStatus("error");
        } else {
            setStatus("loading");
        }
    }, [src]);

    const onLoad = () => {
        setStatus("success");
    };

    const onError = () => {
        setStatus("error");
    };

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img
                style={status === "success" ? { display: "flex" } : { display: "none" }}
                onLoad={onLoad}
                onError={onError}
                src={src}
                alt="cover_image"
                {...rest}
            />

            {status === "loading" && <div style={{ backgroundColor: theme.palette.action.hover }} {...rest} />}

            {status === "error" && <img src={Cover} alt="cover_image" {...rest} />}
        </div>
    );
}
