import { Avatar, Box, Button, Checkbox, Divider, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getGenderLabel, ShowNotification } from "../helpers/Misc";
import { getAPIUrl } from "../helpers/API";
import AddIcon from '@mui/icons-material/Add';
import axios from "axios";
import { useAuth } from "../providers/AuthProvider";

function WaifuRelationshipEditor({ onReload, primaryCharacter }) {
    const [id, setId] = useState(null); // If ID is set, we are editing an existing relationship
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
            console.log(_relationships);
            setRelationships(_relationships); // Set the relationships to the primary character's relationships
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

    return (
        <>
            <Typography variant="h6" component="h2">
                Edit relationship for {primaryCharacter?.name}
            </Typography>
            <Box sx={{ 
                mt: 2, 
                maxHeight: '70vh',
                overflowY: 'auto',
                overflowX: 'hidden',
                }}>
                {/* select character */}
                <Stack>
                    {
                        relatableCharacters.length > 0 && (
                            <>
                                {
                                    relatableCharacters.map((character) => {
                                        let primaryCharacterId = primaryCharacter.id;
                                        let secondaryCharacterId = character.id;
                                        if (primaryCharacterId > secondaryCharacterId) {
                                            primaryCharacterId = character.id;
                                            secondaryCharacterId = primaryCharacter.id;
                                        }
                                        return (<>
                                            <Typography variant="h6" component="h2" key={character.id}>
                                                {getGenderLabel(character.gender).symbol} {character.name}
                                                <IconButton size="small" color="primary" variant="outlined" sx={{ ml: 2 }} onClick={() => {
                                                    //add empty relationship to the relationships array
                                                    let _rel = {
                                                        id: null,
                                                        from_id: primaryCharacterId,
                                                        to_id: secondaryCharacterId,
                                                        relationship_type: null,
                                                        reciprocal_relationship_type: null,
                                                        tempId: relationships.length,
                                                        visualize: true,
                                                    }

                                                    //just add it to the array, no need to check for duplicates (since values are null)
                                                    setRelationships((prev) => {
                                                        return [...prev, _rel]
                                                    });
                                                }}>
                                                    <AddIcon />
                                                </IconButton>
                                                {/* list character relationships here, for now just a mockup we can reuse later */}

                                                {/* prim character is {input} of sec character */}
                                                {
                                                    relationships.map((relationship) => {
                                                        //if any of the ids match character.id
                                                        if (relationship.from_id === character.id || relationship.to_id === character.id) {
                                                            return (
                                                                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 2 }} key={relationship.tempId}>
                                                                    <WaifuRelationshipEditorFields key={relationship.id} from_character={character} to_character={primaryCharacter} relationship={relationship.relationship_type} reciprocal_relationship={relationship.reciprocal_relationship_type} onUpdateValues={onUpdateRelationship} tempId={relationship.tempId} visualize={relationship.visualize} />
                                                                    <Button variant="outlined" color="error" size="small" sx={{ ml: 1 }} onClick={() => {
                                                                        //remove relationship from the relationships array
                                                                        setRelationships((prev) => {
                                                                            return prev.filter((item) => item.tempId !== relationship.tempId);
                                                                        });
                                                                    }}>Remove</Button>
                                                                </Box>
                                                            )
                                                        }
                                                        return null;
                                                    })
                                                }
                                            </Typography>
                                        </>)
                                    })
                                }
                            </>
                        )
                    }
                </Stack>
            </Box>
            <Divider sx={{ my: 2 }} />

            <Button variant="outlined" color="primary" size="small" sx={{ ml: 2 }} onClick={() => {
                onUpdate();
            }}>
                Save
            </Button>
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
            flexDirection: 'row',
            justifyContent: 'center',
        }}>
            {/* center vertically */}
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Typography variant="body1" component="p" sx={{ ml: 2 }}><b>{to_character.name}</b></Typography>
                    <Typography variant="body1" component="p" sx={{ ml: 2 }}>→</Typography>
                    <Typography variant="body1" component="p" sx={{ ml: 2 }}>{from_character.name}</Typography>
                </Box>
                <TextField
                    size="small"
                    variant="outlined"
                    placeholder="Relationship"
                    sx={{ width: 'auto' }}
                    value={relA?.label}
                    onChange={(e) => setRelA({
                        id: to_character.id,
                        label: e.target.value,
                    })}
                />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Typography variant="body1" component="p" sx={{ ml: 2 }}>{from_character.name}</Typography>
                    <Typography variant="body1" component="p" sx={{ ml: 2 }}>→</Typography>
                    <Typography variant="body1" component="p" sx={{ ml: 2 }}><b>{to_character.name}</b></Typography>
                </Box>
                <TextField
                    size="small"
                    variant="outlined"
                    placeholder="Relationship"
                    sx={{ width: 'auto' }}
                    value={relB?.label}
                    onChange={(e) => setRelB({
                        id: from_character.id,
                        label: e.target.value,
                    })}
                />
            </Box>
            <Box>
                {/* checkbox to toggle visualize on or off */}
                <FormControlLabel control={<Checkbox checked={isVisualize} onChange={(e) => setIsVisualize(e.target.checked)} />} label="Visualize" />
            </Box>
        </Box>
    )
}

export default WaifuRelationshipEditor;