import { Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { getAPIUrl } from "../helpers/API";
import { ShowNotification } from "../helpers/Misc";
import { useAuth } from "../providers/AuthProvider";

// user registration page
function RouteLogin() {
    const [inputUsername, setInputUsername] = useState("");
    const [inputPassword, setInputPassword] = useState("");
    const [isWorking, setIsWorking] = useState(false);
    const { login } = useAuth();

    const onLogin = async (e) => {
        // e.preventDefault();
        // setError('');

        // const result = await login(username, password);
        // if (!result.success) {
        //     setError(result.message);
        // }

        e.preventDefault();
        setIsWorking(true);

        const result = await login(inputUsername, inputPassword);
        if (result.success) {
            ShowNotification("Login successful", "success");
            // window.location.href = "/";
        } else {
            ShowNotification(result.message, "error");
        }
        setIsWorking(false);
    }

    return (
        <Box>
            <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={1} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: '28px' }}>
                    <Stack spacing={2.5}>
                        <Box>
                            <Typography variant="overline" color="text.secondary">Account access</Typography>
                            <Typography variant="h4" component="h1" gutterBottom>
                                Login
                            </Typography>
                            <Typography color="text.secondary">
                                Continue into the archive and pick up where you left off.
                            </Typography>
                        </Box>
                        <Box component="form" noValidate autoComplete="off">
                            <TextField
                                disabled={isWorking}
                                label="Username"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={inputUsername}
                                onChange={(e) => setInputUsername(e.target.value)}
                            />
                            <TextField
                                disabled={isWorking}
                                label="Password"
                                type="password"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={inputPassword}
                                onChange={(e) => setInputPassword(e.target.value)}
                            />

                            <Button disabled={isWorking} variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={onLogin}>Login</Button>
                        </Box>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}

export default RouteLogin;