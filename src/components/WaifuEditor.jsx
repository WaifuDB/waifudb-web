import { Autocomplete, Box, Button, Container, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { ShowNotification } from "../helpers/Misc";
import axios from "axios";
import { getAPIUrl } from "../helpers/API";
import FileUploadBox from "./FileUploadBox";

function WaifuEditor(props) {
    const [inputName, setInputName] = useState('');
    const [inputJpName, setInputJpName] = useState('');
    const [inputAge, setInputAge] = useState('');
    const [inputGender, setInputGender] = useState('female');
    const [inputImageFile, setInputImageFile] = useState(null);
    const [inputBirthplace, setInputBirthplace] = useState('');
    const [inputBirthdate, setInputBirthdate] = useState('');
    const [inputHeight, setInputHeight] = useState('');
    const [inputWeight, setInputWeight] = useState('');
    const [inputBloodType, setInputBloodType] = useState('');
    const [inputCupsize, setInputCupsize] = useState('');
    const [inputBust, setInputBust] = useState('');
    const [inputWaist, setInputWaist] = useState('');
    const [inputHips, setInputHips] = useState('');
    const [inputDescription, setInputDescription] = useState('');
    const [inputSource, setInputSource] = useState('');

    const [sourceData, setSourceData] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    const onPrefill = (data, skip_source = false) => {
        setInputName(data.name || '');
        setInputJpName(data.jp_name || '');
        setInputAge(data.age || '');
        setInputGender(data.gender || 'female');
        setInputBirthplace(data.birth_place || '');
        setInputBirthdate(data.birth_date || '');
        setInputHeight(data.height || '');
        setInputWeight(data.weight || '');
        setInputBloodType(data.blood_type || '');
        setInputCupsize(data.cup_size || '');
        setInputBust(data.bust || '');
        setInputWaist(data.waist || '');
        setInputHips(data.hip || '');
        setInputDescription(data.description || '');
        if (!skip_source) {
            setInputSource(data.sources?.[0]?.name || '');
        }
    }

    const reloadSources = async () => {
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
    }


    useEffect(() => {
        if (props.prefill) {
            onPrefill(props.prefill);
        }

        (async () => {
            reloadSources();
        })();
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        let submit_data = {
            name: inputName,
            jp_name: inputJpName,
            age: inputAge,
            gender: inputGender,
            birthplace: inputBirthplace,
            birthdate: inputBirthdate,
            blood_type: inputBloodType,
            cup_size: inputCupsize,
            height: inputHeight,
            weight: inputWeight,
            bust: inputBust,
            waist: inputWaist,
            hip: inputHips,
            description: inputDescription,
            source: inputSource,
        }

        try {
            if (submit_data.name.length < 3) {
                throw new Error("Name must be at least 3 characters long.");
            }

            if (submit_data.source.length < 3) {
                throw new Error("Source must be at least 3 characters long.");
            }

            // return data;
            props?.onSubmit(submit_data);

            //add the source to the list if it doesn't exist
            const sourceExists = sourceData.some(source => source.name === submit_data.source);
            if (!sourceExists) {
                const newSource = {
                    name: submit_data.source,
                    characters: [],
                };
                setSourceData([...sourceData, newSource]);
            }
        } catch (err) {
            ShowNotification(err.message, "error");
            console.error(err);
        } finally {
            // reloadSources();
        }
    }

    const onPasteThreeSizes = (e) => {
        const pastedData = e.clipboardData.getData('text');
        //can expect the following format: Bxx-Wxx-Hxx (xx are numbers, can be any length)
        let match = pastedData.match(/B(\d+)-W(\d+)-H(\d+)/);

        if (!match) {
            //try xx-xx-xx (xx are numbers, can be any length)
            match = pastedData.match(/(\d+)-(\d+)-(\d+)/);
        }

        if (!match) {
            //try Bxx/Wxx/Hxx (xx are numbers, can be any length)
            match = pastedData.match(/B(\d+)\/W(\d+)\/H(\d+)/);
        }

        if (!match) {
            //try xx/xx/xx (xx are numbers, can be any length)
            match = pastedData.match(/(\d+)\/(\d+)\/(\d+)/);
        }

        let [bust, waist, hips] = [];
        if (match) {
            bust = match[1];
            waist = match[2];
            hips = match[3];
        }

        if (bust && waist && hips) {
            setInputBust(bust);
            setInputWaist(waist);
            setInputHips(hips);
            e.preventDefault(); // Prevent the default paste action
        }
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Box sx={{
                //center it
            }}>
                <Grid container spacing={1} sx={{
                    display: 'flex',
                    justifyContent: 'center',
                }}>
                    <Grid size={{ xs: 12, md: 9 }} item>
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
                            {/* gender select dropdown (Male, Female, Non-Binary, Other) */}
                            <FormControl
                                size='small'
                                fullWidth
                                margin="normal"
                            >
                                <InputLabel>Gender</InputLabel>
                                <Select
                                    fullWidth
                                    variant="outlined"
                                    onChange={(e) => setInputGender(e.target.value)}
                                    value={inputGender}
                                >
                                    <MenuItem value={'male'}>Male</MenuItem>
                                    <MenuItem value={'female'}>Female</MenuItem>
                                    <MenuItem value={'non-binary'}>Non-Binary</MenuItem>
                                    <MenuItem value={'other'}>Other</MenuItem>
                                    <MenuItem value={'unknown'}>Unknown</MenuItem>
                                </Select>
                            </FormControl>
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
                                label="Blood Type"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={inputBloodType}
                                onChange={(e) => setInputBloodType(e.target.value)}
                            />
                            <TextField
                                size='small'
                                label="Cupsize (JP)"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={inputCupsize}
                                onChange={(e) => setInputCupsize(e.target.value)}
                            />
                            <TextField
                                size='small'
                                label="Bust"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={inputBust}
                                onChange={(e) => setInputBust(e.target.value)}
                                type="number"
                                onPaste={onPasteThreeSizes}
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
                                onPaste={onPasteThreeSizes}
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
                                onPaste={onPasteThreeSizes}
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
                            <Autocomplete
                                size='small'
                                freeSolo
                                options={sourceData.map((option) => option.name)}
                                renderInput={(params) => <TextField {...params} label="Source" variant="outlined" margin="normal" />}
                                value={inputSource}
                                onChange={(e, newValue) => setInputSource(newValue)}
                                onInputChange={(e, newValue) => setInputSource(newValue)}
                                fullWidth
                                margin="normal"
                            />
                        </Box>

                        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={onSubmit}>Submit</Button>
                        {/* empty all fields */}
                        <Button variant="outlined" color="secondary" fullWidth sx={{ mt: 2 }} onClick={() => { onPrefill({}); }}>Clear</Button>
                        <Button variant="outlined" color="secondary" size='small' fullWidth sx={{ mt: 2 }} onClick={() => { onPrefill({}, true); }}>Clear (keep source)</Button>
                    </Grid>
                </Grid>
            </Box>
        </>
    )
}

export default WaifuEditor;