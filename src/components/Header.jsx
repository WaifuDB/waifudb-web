import { useTheme } from "@mui/material/styles";
import { AppBar, Avatar, Box, Button, IconButton, Menu, Stack, Toolbar, Typography } from "@mui/material";
import { Link } from "react-router";
import { useAuth } from "../providers/AuthProvider";
import HeaderAccountDropdown from "./HeaderAccountDropdown";
import { useState } from "react";
import config from "../../config.json";

function Header() {
    const theme = useTheme();
    const [showMenu, setShowMenu] = useState(null);
    const { user } = useAuth();

    const headerItems = [
        {
            name: 'Sources',
            path: '/sources',
        }
    ]

    return (
        <Box sx={{ position: 'sticky', top: 0, zIndex: theme.zIndex.appBar }}>
            <AppBar position="static" elevation={0}>
                <Box sx={{ width: 'min(1360px, 100%)', mx: 'auto', px: { xs: 1.5, md: 2.5 } }}>
                    <Toolbar disableGutters sx={{ minHeight: 64, gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 0 }}>
                            <Typography variant='h6' noWrap component={Link} to={`/`} sx={{
                                color: theme.palette.primary.main,
                                textDecoration: 'none',
                                fontWeight: 700,
                                letterSpacing: '0.0075em',
                            }}>{config.WEBSITE_NAME}</Typography>
                        </Box>
                        <Box sx={{ display: { xs: 'none', lg: 'block' }, flexGrow: 1 }}>
                            <Stack direction="row" spacing={1.25}>
                                {
                                    headerItems.map((item, index) => (
                                        <Button key={index} component={Link} to={item.path} color="inherit" sx={{ px: 1.75 }}>
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
                                        <Avatar sx={{
                                            width: 32,
                                            height: 32,
                                            bgcolor: theme.palette.primary.main,
                                            color: theme.palette.primary.contrastText,
                                            fontSize: '0.875rem',
                                        }}>{user?.username?.slice?.(0, 1)?.toUpperCase?.() || 'U'}</Avatar>
                                    </IconButton>
                                    <Menu
                                        id="menu-appbar"
                                        sx={{ mt: '12px', pt: 0 }}
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
                                        <Box sx={{ width: 280 }}>
                                            <HeaderAccountDropdown open={Boolean(showMenu)} onClose={() => setShowMenu(null)} />
                                        </Box>
                                    </Menu>
                                </> : <>
                                    <Button component={Link} to={`/login`} variant="text" color="inherit" sx={{ mr: 0.5 }}>
                                        Login
                                    </Button>
                                    <Button component={Link} to={`/register`} variant="contained" color="primary">
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