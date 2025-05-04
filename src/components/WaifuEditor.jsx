import { Box, Container, TextField } from "@mui/material";
import { useState } from "react";

function WaifuEditor() {
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

    return (
        <>
            <Box>
                <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
                    {/* name and jpname one row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
                        <TextField
                            size='small'
                            label="Name"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={inputName}
                            onChange={(e) => setInputName(e.target.value)}
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
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
                </Container>
            </Box>
        </>
    )
}

export default WaifuEditor;