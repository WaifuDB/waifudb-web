import { AppBar, Avatar, Box, Button, IconButton, Menu, Stack, Toolbar, Typography } from "@mui/material";
import { Link } from "react-router";
import { useAuth } from "../providers/AuthProvider";
import HeaderAccountDropdown from "./HeaderAccountDropdown";
import { useEffect, useState } from "react";
import config from "../../config.json";

function Header() {
    const [showMenu, setShowMenu] = useState(null);
    const { user } = useAuth();

    const headerItems = [
        {
            name: 'Sources',
            path: '/sources',
        }
    ]

    return (
        <Box>
            <AppBar position="static">
                <Box sx={{ pl: 2, pr: 2 }}>
                    <Toolbar disableGutters>
                        <Typography variant='h6' noWrap component={Link} to={`/`} sx={{
                            mr: 2,
                            color: 'inherit',
                            textDecoration: 'none',
                        }}>{config.WEBSITE_NAME}</Typography>
                        <Box sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'block', flexGrow: 1 } }}>
                            <Stack direction="row" spacing={2}>
                                {
                                    headerItems.map((item, index) => (
                                        <Button key={index} component={Link} to={item.path} color="inherit" sx={{ mr: 2 }}>
                                            {item.name}
                                        </Button>
                                    ))
                                }
                            </Stack>
                        </Box>
                        <Box sx={{ flexGrow: 0 }}>
                            {
                                user ? <>
                                    <IconButton onClick={(e) => setShowMenu(e.currentTarget)} sx={{ p: 0 }}>
                                        <Avatar alt=''>Test</Avatar>
                                    </IconButton>
                                    <Menu
                                        id="menu-appbar"
                                        sx={{ mt: '45px', pt: 0 }}
                                        keepMounted
                                        anchorEl={showMenu}
                                        anchorOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        open={Boolean(showMenu)}
                                        onClose={() => setShowMenu(null)}
                                    >
                                        <Box sx={{ width: '25em' }}>
                                            <HeaderAccountDropdown open={Boolean(showMenu)} onClose={() => setShowMenu(null)} />
                                        </Box>
                                    </Menu>
                                </> : <>
                                    <Button component={Link} to={`/login`} variant="outlined" color="inherit" sx={{ mr: 2 }}>
                                        Login
                                    </Button>
                                    <Button component={Link} to={`/register`} variant="contained" color="inherit" sx={{ mr: 2 }}>
                                        Register
                                    </Button>
                                </>
                            }
                        </Box>
                    </Toolbar>
                </Box>
            </AppBar>
        </Box>
    )
}

export default Header;