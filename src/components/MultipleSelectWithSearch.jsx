import { Avatar, Box, Checkbox, Chip, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, TextField } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

function DebouncedTextField({ onChange, delay = 500, ...props }) {
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            onChange?.(inputValue);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [inputValue, delay, onChange]);

    return (
        <TextField
            {...props}
            value={inputValue}
            onChange={(e) => setInputValue(e.target?.value)}
        />
    );
}

function MultipleSelectWithSearch({ options, onUpdate }) {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [inputValue, setInputValue] = useState('');

    const [optionsList, setOptionsList] = useState({});

    useEffect(() => {
        setOptionsList(options);
    }, [options]);

    const filteredOptions = useMemo(() => {
        // return options.filter((option) =>
        //     option.name.toLowerCase().includes(inputValue.toLowerCase())
        // );
        //options is an object with [id] => {id, name, ...}
        const lowerInputValue = inputValue.toLowerCase();
        return Object.values(optionsList).filter((option) => {
            return option.name.toLowerCase().includes(lowerInputValue);
        }
        );
    }, [inputValue, optionsList]);

    return <>
        {/* search input */}
        <DebouncedTextField
            label="Search"
            variant="outlined"
            value={inputValue}
            onChange={(value) => setInputValue(value)}
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
                const selectedOption = optionsList[option];
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
                                <Avatar src={`https://cdn.kirino.sh/i/${option.remote_image_id}.jpg`} />
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