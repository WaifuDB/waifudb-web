import { Avatar, Box, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getGenderLabel, ShowNotification } from "../helpers/Misc";
import { getAPIUrl } from "../helpers/API";
import AddIcon from '@mui/icons-material/Add';

function WaifuRelationshipEditor({ primaryCharacter }) {
    const [id, setId] = useState(null); // If ID is set, we are editing an existing relationship
    const [character1, setCharacter1] = useState(null); // Character ID 1
    const [relationships, setRelationships] = useState([]);

    const [relatableCharacters, setRelatableCharacters] = useState([]); // List of characters that can be related to the primary character (basically all sharing a source)

    useEffect(() => {
        if (primaryCharacter) {
            setCharacter1(primaryCharacter); // Set character ID 1 to the primary character's ID
        }

        // Fetch all sources individually (mostly it's just one source, so it's not a big deal)
        (async () => {
            let _characters = [];
            try {
                // primaryCharacter?.sources?.forEach(async (source) => {
                for (const source of primaryCharacter?.sources) {
                    const id = source.id;
                    const response = await fetch(`${getAPIUrl()}/sources/get/${id}`);
                    if (response.status !== 200) {
                        throw new Error('Failed to fetch sources data');
                    }
                    const sourceData = await response.json();
                    if (!sourceData) {
                        throw new Error('No data found for the sources');
                    }
                    _characters = [..._characters, ...sourceData.characters];
                };
            } catch (err) {
                console.error('Error fetching data:', err);
                ShowNotification(err.message, "error");
            }

            _characters = _characters.filter((item, index) => _characters.findIndex(i => i.id === item.id) === index);
            _characters = _characters.filter((item) => item.id !== primaryCharacter.id);
            setRelatableCharacters(_characters);
            console.log(_characters);
        })();
    }, [primaryCharacter]);

    if (!relatableCharacters || relatableCharacters.length === 0) {
        return (
            <Typography variant="h6" component="h2">
                No characters available to relate to {primaryCharacter?.name}
            </Typography>
        );
    }

    return (
        <>
            <Typography variant="h6" component="h2">
                Edit relationship for {primaryCharacter?.name}
            </Typography>
            <Box sx={{ mt: 2 }}>
                {/* select character */}
                <Stack>
                    {
                        relatableCharacters.length > 0 && (
                            <>
                                {
                                    relatableCharacters.map((character) => (
                                        <>
                                            <Typography variant="h6" component="h2" key={character.id}>
                                                {getGenderLabel(character.gender).symbol} {character.name}
                                                <IconButton size="small" color="primary" variant="outlined" sx={{ ml: 2 }}>
                                                    <AddIcon />
                                                </IconButton>
                                                {/* list character relationships here, for now just a mockup we can reuse later */}

                                                {/* prim character is {input} of sec character */}
                                                <WaifuRelationshipEditorFields character1={primaryCharacter} character2={character} />
                                            </Typography>
                                        </>
                                    ))
                                }
                            </>
                        )
                    }
                </Stack>
            </Box>
        </>
    );
}

function WaifuRelationshipEditorFields({ character1, character2 }) {
    const [id, setId] = useState(null); // If ID is set, we are editing an existing relationship
    const [tempId, setTempId] = useState(null); // Temporary ID for looking up in the local state
    const [relA, setRelA] = useState(null); // Relationship A
    const [relB, setRelB] = useState(null); // Relationship B

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
        }}>
            {/* center vertically */}
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Typography variant="body1" component="p" sx={{ ml: 2 }}><b>{character1.name}</b></Typography>
                    <Typography variant="body1" component="p" sx={{ ml: 2 }}>→</Typography>
                    <Typography variant="body1" component="p" sx={{ ml: 2 }}>{character2.name}</Typography>
                </Box>
                <TextField
                    size="small"
                    variant="outlined"
                    placeholder="Relationship"
                    sx={{ width: 'auto' }}
                    value={relA}
                    onChange={(e) => setRelA(e.target.value)}
                />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Typography variant="body1" component="p" sx={{ ml: 2 }}>{character2.name}</Typography>
                    <Typography variant="body1" component="p" sx={{ ml: 2 }}>→</Typography>
                    <Typography variant="body1" component="p" sx={{ ml: 2 }}><b>{character1.name}</b></Typography>
                </Box>
                <TextField
                    size="small"
                    variant="outlined"
                    placeholder="Relationship"
                    sx={{ width: 'auto' }}
                    value={relB}
                    onChange={(e) => setRelB(e.target.value)}
                />
            </Box>
        </Box>
    )
}

export default WaifuRelationshipEditor;