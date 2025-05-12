import { Box, Grid, ImageList, ImageListItem, Modal, Paper } from "@mui/material";
import { useState } from "react";

function ImageGallery({ image_data, columns = 8 }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [open, setOpen] = useState(false);

    return <>
        <Modal
            open={open}
            onClose={() => {
                setOpen(false);
                setSelectedImage(null);
            }}
        >
            <ImageViewer item={selectedImage} />
        </Modal>
        <ImageList
            sx={{ width: '100%', height: 'auto' }}
            variant="masonry"
            cols={columns}
        >
            {
                image_data.map((item) => (
                    <ImageListItem key={item.id} sx={{
                        width: '100%',
                        height: 'auto',
                        '&:hover': {
                            cursor: 'pointer',
                            transform: 'scale(0.95)',
                            transition: 'transform 0.2s',
                        },
                        transition: 'transform 0.2s',
                    }}>
                        <img
                            // src={`${item.image_url}?fit=crop&auto=format`}
                            // srcSet={`${item.image_url}?fit=crop&auto=format&dpr=2 2x`}
                            src={`https://cdn.kirino.sh/i/${item.remote_id}.jpg?w=500&h=500&fit=crop&auto=format`}
                            srcSet={`https://cdn.kirino.sh/i/${item.remote_id}.jpg?w=500&h=500&fit=crop&auto=format&dpr=2 2x`}
                            alt={item.name}
                            loading="lazy"
                            style={{
                                backgroundColor: 'transparent',
                                borderRadius: '5px',
                            }}
                            onClick={() => {
                                setSelectedImage(item);
                                setOpen(true);
                            }}
                            //on error, fallback to the full png
                            onError={(e) => {
                                e.target.onerror = null; // prevents looping
                                e.target.src = `https://cdn.kirino.sh/i/${item.remote_id}.png`;
                            }}
                        />
                    </ImageListItem>
                ))
            }
        </ImageList>
    </>
}

function ImageViewer({ item }) {
    return <>
        <Paper
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                height: '80%',
                p: 4,
            }}
        >
            <Grid container spacing={2} sx={{ height: '100%' }}>
                <Grid item size={{ xs: 12, md: 3 }} sx={{ height: '100%' }}>

                </Grid>
                <Grid item size={{ xs: 12, md: 9 }} sx={{ 
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    }}>
                    <img
                        src={`https://cdn.kirino.sh/i/${item.remote_id}.png`}
                        srcSet={`https://cdn.kirino.sh/i/${item.remote_id}.png`}
                        alt={item.name}
                        loading="lazy"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            backgroundColor: 'transparent',
                            borderRadius: '4px',
                        }}
                    />
                </Grid>
            </Grid>
        </Paper>
    </>
}

export default ImageGallery;