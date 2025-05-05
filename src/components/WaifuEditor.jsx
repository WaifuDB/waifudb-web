import { Box, Button, Container, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { ShowNotification } from "../helpers/Misc";
import axios from "axios";
import { getAPIUrl } from "../helpers/API";

function WaifuEditor(props) {
    const [inputName, setInputName] = useState('');
    const [inputJpName, setInputJpName] = useState('');
    const [inputAge, setInputAge] = useState('');
    const [inputImageUrl, setInputImageUrl] = useState('');
    const [inputBirthplace, setInputBirthplace] = useState('');
    const [inputBirthdate, setInputBirthdate] = useState('');
    const [inputHeight, setInputHeight] = useState('');
    const [inputWeight, setInputWeight] = useState('');
    const [inputBust, setInputBust] = useState('');
    const [inputWaist, setInputWaist] = useState('');
    const [inputHips, setInputHips] = useState('');
    const [inputDescription, setInputDescription] = useState('');
    const [inputSource, setInputSource] = useState('');

    const [sourceData, setSourceData] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${getAPIUrl()}/sources/get/all`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch sources');
                }
                const sources = response.data;
                if (!sources) {
                    throw new Error('No sources found');
                }
                setSourceData(sources);
            } catch (error) {
                ShowNotification(error.message, "error");
                console.error('Error fetching sources:', error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        const data = {
            name: inputName,
            jp_name: inputJpName,
            age: inputAge,
            image_url: inputImageUrl,
            birthplace: inputBirthplace,
            birthdate: inputBirthdate,
            height: inputHeight,
            weight: inputWeight,
            bust: inputBust,
            waist: inputWaist,
            hips: inputHips,
            description: inputDescription,
            source: inputSource,
        }
        try {
            if (data.name.length < 3) {
                throw new Error("Name must be at least 3 characters long.");
            }

            if(data.source.length < 3){
                throw new Error("Source must be at least 3 characters long.");
            }

            // return data;
            props?.onSubmit(data);
        } catch (err) {
            ShowNotification(err.message, "error");
            console.error(err);
        }
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Box>
                <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
                    {/* name and jpname one row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <TextField
                            size='small'
                            label="Name"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={inputName}
                            onChange={(e) => setInputName(e.target.value)}
                            required
                        />
                        <TextField
                            size='small'
                            label="Japanese Name"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={inputJpName}
                            onChange={(e) => setInputJpName(e.target.value)}
                        />
                        <TextField
                            size='small'
                            label="Age"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={inputAge}
                            onChange={(e) => setInputAge(e.target.value)}
                            type="number"
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <TextField
                            size='small'
                            label="Birthplace"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={inputBirthplace}
                            onChange={(e) => setInputBirthplace(e.target.value)}
                        />
                        <TextField
                            size='small'
                            label="Birthdate"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={inputBirthdate}
                            onChange={(e) => setInputBirthdate(e.target.value)}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <TextField
                            size='small'
                            label="Bust"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={inputBust}
                            onChange={(e) => setInputBust(e.target.value)}
                            type="number"
                        />
                        <TextField
                            size='small'
                            label="Waist"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={inputWaist}
                            onChange={(e) => setInputWaist(e.target.value)}
                            type="number"
                        />
                        <TextField
                            size='small'
                            label="Hips"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={inputHips}
                            onChange={(e) => setInputHips(e.target.value)}
                            type="number"
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <TextField
                            size='small'
                            label="Height"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={inputHeight}
                            onChange={(e) => setInputHeight(e.target.value)}
                            type="number"
                        />
                        <TextField
                            size='small'
                            label="Weight"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={inputWeight}
                            onChange={(e) => setInputWeight(e.target.value)}
                            type="number"
                        />
                    </Box>
                    <Box>
                        <TextField
                            size='small'
                            label="Description"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={inputDescription}
                            onChange={(e) => setInputDescription(e.target.value)}
                            multiline
                            rows={4}
                        />
                    </Box>
                    <Box>
                        {/* <TextField
                            size='small'
                            label="Source"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={inputSource}
                            onChange={(e) => setInputSource(e.target.value)}
                        /> */}
                        {/* smart textfield with a dropdown */}
                        <TextField
                            size='small'
                            label=""
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={inputSource}
                            onChange={(e) => setInputSource(e.target.value)}
                            select
                            SelectProps={{
                                native: true,
                            }}
                            required
                        >
                            <option value="">Select a source</option>
                            {sourceData.map((source) => (
                                <option key={source.id} value={source.name}>
                                    {source.name}
                                </option>
                            ))}
                        </TextField>
                    </Box>
                    <Box>
                        <TextField
                            size='small'
                            label="Image URL"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={inputImageUrl}
                            onChange={(e) => setInputImageUrl(e.target.value)}
                        />
                    </Box>

                    <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={onSubmit}>Submit</Button>
                </Container>
            </Box>
        </>
    )
}

export default WaifuEditor;