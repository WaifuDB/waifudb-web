import { Box, Button, Checkbox, Divider, FormControlLabel, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getGenderLabel, ShowNotification } from "../helpers/Misc";
import { getAPIUrl } from "../helpers/API";
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import axios from "axios";
import { useAuth } from "../providers/AuthProvider";

function WaifuRelationshipEditor({ onReload, primaryCharacter }) {
    const [relationships, setRelationships] = useState([]);
    const { user, token } = useAuth(); // Get user_id and token from the primary character

    const [relatableCharacters, setRelatableCharacters] = useState([]); // List of characters that can be related to the primary character (basically all sharing a source)

    useEffect(() => {
        if (primaryCharacter) {
            let _relationships = primaryCharacter.relationships || []; // Get the relationships from the primary character
            //add a fake ID to the relationships array, used for indexing
            _relationships = _relationships.map((item, index) => {
                return {
                    ...item,
                    tempId: index,
                }
            });
            setRelationships(_relationships); // Set the relationships to the primary character's relationships
        }

        // Fetch source data in parallel and merge unique characters.
        (async () => {
            const uniqueCharacters = new Map();
            try {
                const sources = primaryCharacter?.sources || [];
                const responses = await Promise.all(
                    sources.map((source) => fetch(`${getAPIUrl()}/sources/get/${source.id}`))
                );

                const sourcePayloads = await Promise.all(responses.map(async (response) => {
                    if (response.status !== 200) {
                        throw new Error('Failed to fetch sources data');
                    }

                    const sourceData = await response.json();
                    if (!sourceData) {
                        throw new Error('No data found for the sources');
                    }

                    return sourceData;
                }));

                sourcePayloads.forEach((sourceData) => {
                    (sourceData.characters || []).forEach((character) => {
                        if (!uniqueCharacters.has(character.id)) {
                            uniqueCharacters.set(character.id, character);
                        }
                    });
                });
            } catch (err) {
                console.error('Error fetching data:', err);
                ShowNotification(err.message, "error");
            }

            let _characters = [...uniqueCharacters.values()];
            _characters = _characters.filter((item) => item.id !== primaryCharacter.id);
            setRelatableCharacters(_characters);
        })();
    }, [primaryCharacter]);

    if (!relatableCharacters || relatableCharacters.length === 0) {
        return (
            <Typography variant="h6" component="h2">
                No characters available to relate to {primaryCharacter?.name}
            </Typography>
        );
    }

    const onUpdateRelationship = (tempId, relA, relB, isVisualize) => {
        //update the relationship in the relationships array
        setRelationships((prev) => {
            return prev.map((item) => {
                if (item.tempId === tempId) {
                    return {
                        ...item,
                        // relationship_type: relA,
                        relationship_type: item.from_id === primaryCharacter.id ? relA?.label : relB?.label,
                        reciprocal_relationship_type: item.from_id === primaryCharacter.id ? relB?.label : relA?.label,
                        visualize: isVisualize,
                    }
                }
                return item;
            });
        });
    }

    const onUpdate = async () => {
        //sends the entire relationships array to the server, let the server handle the rest
        try{
            const url = `${getAPIUrl()}/characters/relationships/update`;
            const body = {
                //send without character and tempId
                relationships: relationships,
                target_id: primaryCharacter.id,
                user_id: user.id,
                token: token,
            }

            const response = await axios.post(url, body, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
            });

            const dataResponse = response.data;

            if(response.status !== 200){ // 200 OK
                throw new Error(dataResponse.error || "Unknown error occurred.");
            }

            ShowNotification("Relationships updated successfully", "success");

            onReload(); // Reload the page to show the updated relationships
        }catch(err){
            console.error(err);
            ShowNotification(err.message, "error");
        }
    }

    const getCharacterRelationships = (characterId) => {
        return relationships.filter((relationship) => relationship.from_id === characterId || relationship.to_id === characterId);
    }

    return (
        <>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                Edit relationship for {primaryCharacter?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Add or update relationship labels in both directions for each character.
            </Typography>
            <Box sx={{
                mt: 2,
                maxHeight: '70vh',
                overflowY: 'auto',
                overflowX: 'hidden',
            }}>
                <Stack spacing={2}>
                    {relatableCharacters.length > 0 && relatableCharacters.map((character) => {
                        const characterRelationships = getCharacterRelationships(character.id);
                        let primaryCharacterId = primaryCharacter.id;
                        let secondaryCharacterId = character.id;
                        if (primaryCharacterId > secondaryCharacterId) {
                            primaryCharacterId = character.id;
                            secondaryCharacterId = primaryCharacter.id;
                        }

                        return (
                            <Paper key={character.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={1.5}>
                                    <Typography variant="h6" component="h3" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
                                        {getGenderLabel(character.gender).symbol} {character.name}
                                    </Typography>
                                    <Button
                                        tabIndex="-1"
                                        size="small"
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        onClick={() => {
                                            // Add a blank relationship row and keep direction ordering deterministic.
                                            let _rel = {
                                                id: null,
                                                from_id: primaryCharacterId,
                                                to_id: secondaryCharacterId,
                                                relationship_type: null,
                                                reciprocal_relationship_type: null,
                                                tempId: relationships.length,
                                                visualize: true,
                                            }

                                            setRelationships((prev) => {
                                                return [...prev, _rel]
                                            });
                                        }}
                                    >
                                        Add Relationship
                                    </Button>
                                </Stack>

                                <Stack spacing={1.5} sx={{ mt: 2 }}>
                                    {characterRelationships.length === 0 && (
                                        <Typography variant="body2" color="text.secondary">
                                            No relationship rows yet.
                                        </Typography>
                                    )}

                                    {characterRelationships.map((relationship) => {
                                        return (
                                            <Paper key={relationship.tempId} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.default' }}>
                                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <WaifuRelationshipEditorFields
                                                            key={relationship.id}
                                                            from_character={character}
                                                            to_character={primaryCharacter}
                                                            relationship={relationship.relationship_type}
                                                            reciprocal_relationship={relationship.reciprocal_relationship_type}
                                                            onUpdateValues={onUpdateRelationship}
                                                            tempId={relationship.tempId}
                                                            visualize={relationship.visualize}
                                                        />
                                                    </Box>
                                                    <Button
                                                        tabIndex="-1"
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        startIcon={<DeleteOutlineIcon />}
                                                        onClick={() => {
                                                            setRelationships((prev) => {
                                                                return prev.filter((item) => item.tempId !== relationship.tempId);
                                                            });
                                                        }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </Stack>
                                            </Paper>
                                        )
                                    })}
                                </Stack>
                            </Paper>
                        )
                    })}
                </Stack>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Stack direction="row" justifyContent="flex-end">
                <Button variant="contained" color="primary" size="medium" onClick={() => {
                    onUpdate();
                }}>
                    Save Relationships
                </Button>
            </Stack>
        </>
    );
}

function WaifuRelationshipEditorFields({ tempId, visualize, from_character, to_character, relationship, reciprocal_relationship, onUpdateValues }) {
    const [relA, setRelA] = useState({id: to_character.id, label: relationship || null}); // Relationship A
    const [relB, setRelB] = useState({id: from_character.id, label: reciprocal_relationship || null}); // Relationship B
    const [isVisualize, setIsVisualize] = useState(visualize); // Visualize relationship

    const internalOnUpdateValues = () => {
        //update the values in the parent component
        if (onUpdateValues && (relA || relB)) {
            onUpdateValues(tempId, relA, relB, isVisualize);
        }
    }

    useEffect(() => {
        if ((tempId || tempId === 0) && (relA || relB)) {
            internalOnUpdateValues();
        }
    }, [relA, relB, isVisualize]); // Update when relA, relB or isVisualize changes

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', xl: 'row' },
            gap: 1.25,
        }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', minWidth: 220 }}>
                    <Typography variant="body2" component="p" sx={{ fontWeight: 700, mr: 1 }}>{to_character.name}</Typography>
                    <Typography variant="body2" component="p" sx={{ color: 'text.secondary', mr: 1 }}>→</Typography>
                    <Typography variant="body2" component="p" sx={{ color: 'text.secondary' }}>{from_character.name}</Typography>
                </Box>
                <TextField
                    size="small"
                    variant="outlined"
                    placeholder="Type (e.g. friend, sibling)"
                    sx={{ flex: 1, minWidth: 180 }}
                    value={relA?.label}
                    onChange={(e) => setRelA({
                        id: to_character.id,
                        label: e.target.value,
                    })}
                />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', minWidth: 220 }}>
                    <Typography variant="body2" component="p" sx={{ color: 'text.secondary', mr: 1 }}>{from_character.name}</Typography>
                    <Typography variant="body2" component="p" sx={{ color: 'text.secondary', mr: 1 }}>→</Typography>
                    <Typography variant="body2" component="p" sx={{ fontWeight: 700 }}>{to_character.name}</Typography>
                </Box>
                <TextField
                    size="small"
                    variant="outlined"
                    placeholder="Type (e.g. rival, mentor)"
                    sx={{ flex: 1, minWidth: 180 }}
                    value={relB?.label}
                    onChange={(e) => setRelB({
                        id: from_character.id,
                        label: e.target.value,
                    })}
                />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', pl: { xs: 0, xl: 1 } }}>
                <FormControlLabel control={<Checkbox tabIndex="-1" checked={isVisualize} onChange={(e) => setIsVisualize(e.target.checked)} />} label="Visualize" />
            </Box>
        </Box>
    )
}

export default WaifuRelationshipEditor;