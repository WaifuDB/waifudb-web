import { Autocomplete, Box, Button, Container, Divider, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getAPIUrl } from "../helpers/API";
import axios from "axios";
import { ShowNotification } from "../helpers/Misc";

function ImageEditor(props) {
    const [inputImageUrl, setInputImageUrl] = useState(null);
    const [imageDetails, setImageDetails] = useState(null);
    const [inputCharacterArray, setInputCharacterArray] = useState([]);
    const [characterDatabase, setCharacterDatabase] = useState([]);

    const onPrefill = (data) => {
        setInputImageUrl(data.image_url);
        setInputCharacterArray(data.characters);
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        const data = {
            image_url: inputImageUrl,
            characters: inputCharacterArray,
        }

        try{
            //some validation
            if (!inputImageUrl) {
                throw new Error("Please enter an image URL.");
            }

            if (inputCharacterArray.length === 0) {
                throw new Error("Please select at least one character.");
            }

            if(!props.onSubmit){
                throw new Error("No onSubmit function provided.");
            }

            props?.onSubmit(data);
        }catch(err){
            console.error(err);
            ShowNotification(err.message, "error");
        }
    }

    useEffect(() => {
        if (props.prefill) {
            onPrefill(props.prefill);
        }

        (async () => {
            const url = `${getAPIUrl()}/characters/get/all`;
            const response = await axios.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
            });
            const dataResponse = response.data;
            if (response.status !== 200) { // 200 OK
                throw new Error(dataResponse.error || "Unknown error occurred.");
            }
            //remap to an object with [id] => {id, name, ...} for fast lookup by the picker
            let mappedData = {};
            dataResponse.forEach((character) => {
                mappedData[character.id] = character;
            });
            setCharacterDatabase(mappedData);
        })();
    }, []);

    useEffect(() => {
        if (inputImageUrl) {
            const image = new Image();
            image.src = inputImageUrl;
            image.onload = () => {
                setImageDetails({
                    width: image.width,
                    height: image.height,
                });
            };
        } else {
            setImageDetails(null);
        }
    }, [inputImageUrl]);

    if (!characterDatabase || characterDatabase.length === 0) {
        return <Typography variant="body1">Loading...</Typography>
    }

    return <>
        <Box>
            <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
                <Box>
                    <TextField
                        size='small'
                        label="Image URL"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={inputImageUrl}
                        onChange={(e) => setInputImageUrl(e.target.value)}
                        required
                    />
                    {/* characterDatabase is array of objects with id, name... */}
                    <Autocomplete
                        size='small'
                        label="Characters"
                        options={Object.keys(characterDatabase)}
                        multiple
                        required
                        value={inputCharacterArray}
                        onChange={(event, newValue) => {
                            setInputCharacterArray(newValue);
                        }}
                        getOptionLabel={(option) => characterDatabase[option]?.name || ''}
                        renderInput={(params) => (
                            <TextField {...params} label="Characters" variant="outlined" fullWidth margin="normal" />
                        )}
                        //make the selected options clickable so we can see the character details (making sure we select the right one, since we cant show the source of the character directly)

                    />
                    <Button fullWidth variant="contained" color="primary" onClick={onSubmit} sx={{ mt: 2 }}>
                        Submit
                    </Button>
                </Box>
                <Divider sx={{ my: 2 }} />
                {/* Display the image, fill width, height can be infinite if the user wants to kill the browser */}
                {
                    inputImageUrl && <>
                        <Typography variant="h6" gutterBottom>
                            Image Details
                        </Typography>
                        <Typography variant="body1">
                            Width: {imageDetails?.width || 'Loading...'} px
                        </Typography>
                        <Typography variant="body1">
                            Height: {imageDetails?.height || 'Loading...'} px
                        </Typography>
                        <img
                            src={inputImageUrl}
                            alt="Preview"
                            style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: '8px',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                            }}
                        />
                    </>
                }
            </Container>
        </Box>
    </>
}

export default ImageEditor;