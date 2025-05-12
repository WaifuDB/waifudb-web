import { Box, Button, Paper, styled, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

function FileUploadBox({ file: _file, onChange, accept = 'image/*' }) {
    const [file, setFile] = useState(_file || null);
    const fileInputRef = useRef(null);
    const dropRefArea = useRef(null);

    //Handle paste from clipboard
    useEffect(() => {
        const handlePaste = (event) => {
            // Don't do anything if the paste is not a file
            if (!event.clipboardData || !event.clipboardData.items) {
                return;
            }

            // Don't do anything if active element is an input or textarea
            const activeElement = document.activeElement;
            if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
                return;
            }

            const items = event.clipboardData.items;
            const file = Array.from(items).find(item => item.kind === 'file');

            if (file) {
                const blob = file.getAsFile();
                if (blob) {
                    setFile(blob);
                    console.log("Pasted file:", blob);
                }
            }
        }

        document.addEventListener('paste', handlePaste);
        return () => {
            document.removeEventListener('paste', handlePaste);
        }
    }, [])

    useEffect(() => {
        console.log("File changed:", file);
        onChange?.(file);
    }, [file]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            console.log("Selected file:", selectedFile);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    return <>
        <Box sx={{ width: '100%' }}>
            <Paper
                ref={dropRefArea}
                variant='outlined'
                sx={{
                    p: 3,
                    borderRadius: 1,
                    textAlign: 'center',
                    mb: 2,
                }}
            >
                <CloudUploadIcon fontSize="large" color="action" />
                <Typography variant="h6" gutterBottom>
                    Drag & Drop file here
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    or paste from clipboard
                </Typography>
                <Button
                    variant="contained"
                    component="label"
                    onClick={handleClick}
                    sx={{ mt: 1 }}
                >
                    Select File
                    <VisuallyHiddenInput
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept={accept}
                    />
                </Button>
            </Paper>
            {
                //assume file is an image
                file && (
                    <Paper
                        variant='outlined'
                        sx={{
                            p: 2,
                            borderRadius: 1,
                            textAlign: 'center',
                            mb: 2,
                        }}
                    >
                        {/* display some info (size, resolution) */}
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            File: {file.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Size: {(file.size / 1024).toFixed(2)} KB
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Type: {file.type}
                        </Typography>
                        <img
                            src={URL.createObjectURL(file)}
                            alt="Selected"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                            }}></img>
                    </Paper>
                )
            }
        </Box>
    </>
}

export default FileUploadBox;