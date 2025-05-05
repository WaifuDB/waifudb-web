import { Alert, Box, Divider, ListItemIcon, ListItemText, MenuItem, MenuList } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate } from 'react-router';
import { useAuth } from "../providers/AuthProvider";

function HeaderAccountDropdown(props) {
    const { user, canCreate } = useAuth();
    const navigate = useNavigate();

    const closeMenu = () => {
        props.onClose?.();
    }

    if (!props.open) {
        return <></>;
    }

    return (
        <Box>
            <MenuList>
                <MenuItem key={'profile'} onClick={() => { navigate(`/user/${user}`); closeMenu(); }}>
                    <ListItemIcon><PersonIcon /></ListItemIcon>
                    <ListItemText>Profile</ListItemText>
                </MenuItem>
                <MenuItem key={'logout'} onClick={() => { navigate(`/logout`); closeMenu(); }}>
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                </MenuItem>
                {
                    canCreate() && <>
                        {/* seperator */}
                        <Divider />
                        <MenuItem key={'create'} onClick={() => { navigate(`/create`); closeMenu(); }}>
                            <ListItemIcon><PersonAddIcon /></ListItemIcon>
                            <ListItemText>Create</ListItemText>
                        </MenuItem>
                    </>
                }
            </MenuList>
        </Box>
    )
}

export default HeaderAccountDropdown;