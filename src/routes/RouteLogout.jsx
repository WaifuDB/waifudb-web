import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getAPIUrl } from "../helpers/API";
import { ShowNotification } from "../helpers/Misc";
import { useAuth } from "../providers/AuthProvider";

function RouteLogout() {
    const { logout } = useAuth();

    useEffect(() => {
        logout();
    }, []);

    return (
        <></>
    );
}

export default RouteLogout;