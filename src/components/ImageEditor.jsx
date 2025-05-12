import { Autocomplete, Box, Button, Container, Divider, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getAPIUrl } from "../helpers/API";
import axios from "axios";
import { ShowNotification } from "../helpers/Misc";
import FileUploadBox from "./FileUploadBox";
import MultipleSelectWithSearch from "./MultipleSelectWithSearch";

function ImageEditor(props) {
    const [inputImageFile, setInputImageFile] = useState(null);
    const [inputCharacterArray, setInputCharacterArray] = useState([]);
    const [characterDatabase, setCharacterDatabase] = useState([]);
    //characterDatabase is an object with [id] => {id, name, ...} for fast lookup by the picker

    const onPrefill = (data) => {
        // setInputImageUrl(data.image_url);
        setInputCharacterArray(data.characters);
    }

    const handleSelectionUpdate = (selectedItems) => {
        // console.log("Selected items updated:", selectedItems);
        // You can perform any action here with the updated selection
        setInputCharacterArray(selectedItems);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const data = {
            image: inputImageFile,
            characters: inputCharacterArray,
        }

        try {
            //some validation
            if (!inputImageFile) {
                throw new Error("Please select an image.");
            }

            if (inputCharacterArray.length === 0) {
                throw new Error("Please select at least one character.");
            }

            if (!props.onSubmit) {
                throw new Error("No onSubmit function provided.");
            }

            props?.onSubmit(data);
        } catch (err) {
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

    if (!characterDatabase || characterDatabase.length === 0) {
        return <Typography variant="body1">Loading...</Typography>
    }

    return <>
        <Box>
            <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
                <Box>
                    <Button fullWidth variant="contained" color="primary" onClick={onSubmit} sx={{ mt: 2 }}>
                        Submit
                    </Button>
                    <MultipleSelectWithSearch
                        options={characterDatabase}
                        onUpdate={handleSelectionUpdate}
                    />
                    <Box>
                        <FileUploadBox onChange={(file) => setInputImageFile(file)} />
                    </Box>
                </Box>
            </Container>
        </Box>
    </>
}

export default ImageEditor;