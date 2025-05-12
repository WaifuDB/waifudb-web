import { Avatar, Box, Checkbox, Chip, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, TextField } from "@mui/material";
import { useMemo, useState } from "react";

function MultipleSelectWithSearch({ options, onUpdate }) {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [inputValue, setInputValue] = useState('');

    const filteredOptions = useMemo(() => {
        // return options.filter((option) =>
        //     option.name.toLowerCase().includes(inputValue.toLowerCase())
        // );
        //options is an object with [id] => {id, name, ...}
        const lowerInputValue = inputValue.toLowerCase();
        return Object.values(options).filter((option) => {
            return option.name.toLowerCase().includes(lowerInputValue);
        }
        );
    }, [inputValue, options]);

    return <>
        {/* search input */}
        <TextField
            label="Search"
            variant="outlined"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            fullWidth
            margin="normal"
        />
        <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
        }}>
            {/* chips of selected items, with an X to deselect it */}
            {selectedOptions.map((option) => {
                const selectedOption = options[option];
                if (!selectedOption) return null;
                return (
                    <Chip
                        avatar={<Avatar src={selectedOption.image_url} />}
                        label={selectedOption?.name}
                        key={option}
                        onDelete={() => {
                            const newSelectedOptions = selectedOptions.filter((id) => id !== option);
                            setSelectedOptions(newSelectedOptions);
                            onUpdate(newSelectedOptions);
                        }} />
                )
            })}
        </Box>
        <Box sx={{ width: '100%', maxHeight: '250px', overflowY: 'auto', borderRadius: '4px' }}>
            <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {filteredOptions.map((option) => (
                    <ListItem key={option.id} disablePadding dense>
                        <ListItemButton role={undefined} onClick={() => {
                            const newSelectedOptions = selectedOptions.includes(option.id)
                                ? selectedOptions.filter((id) => id !== option.id)
                                : [...selectedOptions, option.id];
                            setSelectedOptions(newSelectedOptions);
                            onUpdate(newSelectedOptions);
                        }} dense>
                            <ListItemAvatar>
                                <Avatar src={option.image_url} />
                            </ListItemAvatar>
                            <ListItemIcon>
                                <Checkbox
                                    edge="start"
                                    checked={selectedOptions.includes(option.id)}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': option.id }}
                                />
                            </ListItemIcon>
                            <ListItemText id={option.id} primary={option.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    </>
}

export default MultipleSelectWithSearch;