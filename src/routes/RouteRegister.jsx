import { Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { getAPIUrl } from "../helpers/API";
import { ShowNotification } from "../helpers/Misc";

// user registration page
function RouteRegister() {
    const [inputUsername, setInputUsername] = useState("");
    const [inputPassword, setInputPassword] = useState("");
    const [inputPasswordConfirm, setInputPasswordConfirm] = useState("");
    const [isWorking, setIsWorking] = useState(false);

    const onRegister = async () => {
        //client-side validation
        setIsWorking(true);

        try{
            if(inputUsername.length < 3 || inputUsername.length > 20){
                throw new Error("Username must be between 3 and 20 characters long.");
            }

            if(inputPassword.length < 8 || inputPassword.length > 20){
                throw new Error("Password must be between 8 and 20 characters long.");
            }

            if(inputPassword !== inputPasswordConfirm){
                throw new Error("Passwords do not match.");
            }

            //todo: send request to server to register user
            const url = `${getAPIUrl()}/auth/register`;
            const body = {
                username: inputUsername,
                password: inputPassword,
            }

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            console.log(data);

            if(response.status !== 201){ // 201 Created
                throw new Error(data.error || "Unknown error occurred.");
            }else{
                ShowNotification("Your account has been made.", "success");
                window.location.href = "/login";
            }
        }catch(e){
            // alert(e.message);
            console.error(e);
            ShowNotification(e.message, "error");
        }

        setIsWorking(false);
    }

    return (
        <Box>
            <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={1} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: '28px' }}>
                    <Stack spacing={2.5}>
                        <Box>
                            <Typography variant="overline" color="text.secondary">New account</Typography>
                            <Typography variant="h4" component="h1" gutterBottom>
                                Register
                            </Typography>
                            <Typography color="text.secondary">
                                Create an account to contribute records and manage uploads.
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
                            <TextField
                                disabled={isWorking}
                                label="Confirm Password"
                                type="password"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={inputPasswordConfirm}
                                onChange={(e) => setInputPasswordConfirm(e.target.value)}
                            />

                            <Button disabled={isWorking} variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={onRegister}>Register</Button>
                        </Box>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}

export default RouteRegister;