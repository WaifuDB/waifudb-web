import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import {
    Box,
    Chip,
    Divider,
    Grid,
    IconButton,
    ImageList,
    ImageListItem,
    Link,
    Modal,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useState } from "react";

const PRIORITY_METADATA_KEYS = [
    'id',
    'remote_id',
    'mime_type',
    'width',
    'height',
    'size',
    'file_size',
    'created_at',
    'updated_at',
];

function getImageUrls(item) {
    if (!item?.remote_id) {
        return {
            previewUrl: '',
            previewSrcSet: '',
            fullUrl: '',
        };
    }

    return {
        previewUrl: `https://cdn.kirino.sh/i/${item.remote_id}.jpg?w=500&h=500&fit=crop&auto=format`,
        previewSrcSet: `https://cdn.kirino.sh/i/${item.remote_id}.jpg?w=500&h=500&fit=crop&auto=format&dpr=2 2x`,
        fullUrl: `https://cdn.kirino.sh/i/${item.remote_id}.png`,
    };
}

function formatMetadataLabel(key) {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatMetadataValue(key, value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    if (typeof value === 'number') {
        if (key === 'size' || key === 'file_size') {
            const units = ['B', 'KB', 'MB', 'GB'];
            let unitIndex = 0;
            let formattedValue = value;

            while (formattedValue >= 1024 && unitIndex < units.length - 1) {
                formattedValue /= 1024;
                unitIndex += 1;
            }

            return `${formattedValue.toFixed(formattedValue >= 100 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
        }

        return value.toLocaleString();
    }

    if (typeof value === 'string') {
        const trimmedValue = value.trim();
        if (!trimmedValue) {
            return null;
        }

        if (/(?:_at|date)$/i.test(key)) {
            const parsedDate = new Date(trimmedValue);
            if (!Number.isNaN(parsedDate.getTime())) {
                return parsedDate.toLocaleString();
            }
        }

        return trimmedValue;
    }

    return String(value);
}

function buildMetadata(item) {
    if (!item) {
        return [];
    }

    const prioritizedEntries = PRIORITY_METADATA_KEYS
        .filter((key) => Object.hasOwn(item, key))
        .map((key) => ({
            key,
            label: formatMetadataLabel(key),
            value: formatMetadataValue(key, item[key]),
        }))
        .filter((entry) => entry.value !== null);

    const seenKeys = new Set(prioritizedEntries.map((entry) => entry.key));

    const additionalEntries = Object.entries(item)
        .filter(([key, value]) => !seenKeys.has(key) && ['string', 'number', 'boolean'].includes(typeof value))
        .map(([key, value]) => ({
            key,
            label: formatMetadataLabel(key),
            value: formatMetadataValue(key, value),
        }))
        .filter((entry) => entry.value !== null);

    return [...prioritizedEntries, ...additionalEntries];
}

function MetadataRow({ label, value }) {
    return (
        <Box
            sx={{
                py: 1.25,
                display: 'grid',
                gridTemplateColumns: 'minmax(96px, 120px) minmax(0, 1fr)',
                gap: 1.5,
                alignItems: 'start',
            }}
        >
            <Typography variant='caption' sx={{ color: 'text.secondary', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {label}
            </Typography>
            <Typography variant='body2' sx={{ wordBreak: 'break-word' }}>
                {value}
            </Typography>
        </Box>
    );
}

function ImageGallery({ image_data, columns = 8 }) {
    const theme = useTheme();
    const [selectedImage, setSelectedImage] = useState(null);

    const handleClose = () => {
        setSelectedImage(null);
    };

    return <>
        {selectedImage ? (
            <Modal
                open
                onClose={handleClose}
                closeAfterTransition
                sx={{
                    backdropFilter: 'blur(10px)',
                    backgroundColor: alpha(theme.palette.background.default, 0.72),
                    p: { xs: 1.5, md: 3 },
                }}
            >
                <ImageViewer
                    item={selectedImage}
                    onClose={handleClose}
                />
            </Modal>
        ) : null}
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
                        borderRadius: '10px',
                        overflow: 'hidden',
                        '&:hover': {
                            cursor: 'pointer',
                            transform: 'scale(0.95)',
                            transition: 'transform 0.2s',
                        },
                        transition: 'transform 0.2s',
                    }}>
                        <img
                            src={getImageUrls(item).previewUrl}
                            srcSet={getImageUrls(item).previewSrcSet}
                            alt={item.name}
                            loading="lazy"
                            style={{
                                backgroundColor: 'transparent',
                                borderRadius: '5px',
                            }}
                            onClick={() => {
                                setSelectedImage(item);
                            }}
                            //on error, fallback to the full png
                            onError={(e) => {
                                e.target.onerror = null; // prevents looping
                                e.target.src = getImageUrls(item).fullUrl;
                            }}
                        />
                    </ImageListItem>
                ))
            }
        </ImageList>
    </>
}

function ImageViewer({ item, onClose }) {
    const theme = useTheme();
    const { fullUrl } = getImageUrls(item);
    const metadata = buildMetadata(item);
    const isDarkMode = theme.palette.mode === 'dark';

    const surfaceBackground = `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.default, 0.96)} 100%)`;
    const sidebarBackground = `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.94)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`;
    const stageBackground = isDarkMode
        ? `radial-gradient(circle at top, ${alpha(theme.palette.primary.dark, 0.34)} 0%, ${alpha(theme.palette.background.default, 0.86)} 45%, ${alpha(theme.palette.common.black, 0.92)} 100%)`
        : `radial-gradient(circle at top, ${alpha(theme.palette.primary.light, 0.3)} 0%, ${alpha(theme.palette.background.default, 0.72)} 45%, ${alpha(theme.palette.grey[300], 0.84)} 100%)`;
    const frameBackground = alpha(theme.palette.background.paper, isDarkMode ? 0.2 : 0.42);
    const frameBorder = alpha(theme.palette.common.white, isDarkMode ? 0.12 : 0.72);
    const innerShadow = isDarkMode
        ? `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.08)}`
        : `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.42)}`;

    return <>
        <Paper
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: 'calc(100% - 24px)', md: 'min(1200px, 92vw)' },
                height: { xs: 'calc(100% - 24px)', md: 'min(820px, 92vh)' },
                overflow: 'hidden',
                borderRadius: 4,
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.9),
                color: theme.palette.text.primary,
                background: surfaceBackground,
                boxShadow: isDarkMode
                    ? `0 28px 96px ${alpha(theme.palette.common.black, 0.52)}`
                    : `0 24px 80px ${alpha(theme.palette.common.black, 0.28)}`,
            }}
        >
            <Grid container sx={{ height: '100%' }}>
                <Grid
                    item
                    size={{ xs: 12, md: 4 }}
                    sx={{
                        height: { xs: 'auto', md: '100%' },
                        borderRight: { xs: 'none', md: '1px solid' },
                        borderBottom: { xs: '1px solid', md: 'none' },
                        borderColor: alpha(theme.palette.divider, 0.85),
                        background: sidebarBackground,
                    }}
                >
                    <Stack spacing={2} sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                            <Box>
                                <Typography variant='overline' sx={{ color: 'text.secondary', letterSpacing: '0.14em' }}>
                                    Image Viewer
                                </Typography>
                                <Typography variant='h5' sx={{ lineHeight: 1.1 }}>
                                    {item?.name || `Image #${item?.id ?? 'Unknown'}`}
                                </Typography>
                                <Typography variant='body2' color='text.secondary' sx={{ mt: 0.75 }}>
                                    Full-size preview with record metadata.
                                </Typography>
                            </Box>
                            <IconButton onClick={onClose} aria-label='Close image viewer'>
                                <CloseRoundedIcon />
                            </IconButton>
                        </Box>

                        <Stack direction='row' spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                            {item?.id ? <Chip label={`ID ${item.id}`} size='small' color='primary' variant='outlined' /> : null}
                            {item?.remote_id ? <Chip label={`Remote ${item.remote_id}`} size='small' variant='outlined' /> : null}
                        </Stack>

                        <Divider />

                        <Box sx={{ minHeight: 0, flex: 1, overflowY: 'auto', pr: 0.5 }}>
                            <Typography variant='subtitle2' sx={{ mb: 1.25 }}>
                                Metadata
                            </Typography>
                            {metadata.length > 0 ? (
                                metadata.map((entry, index) => (
                                    <Box key={entry.key}>
                                        <MetadataRow label={entry.label} value={entry.value} />
                                        {index < metadata.length - 1 ? <Divider /> : null}
                                    </Box>
                                ))
                            ) : (
                                <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic' }}>
                                    No metadata available for this image.
                                </Typography>
                            )}
                        </Box>

                        {fullUrl ? (
                            <Paper
                                variant='outlined'
                                sx={{
                                    p: 1.25,
                                    borderRadius: 3,
                                    backgroundColor: alpha(theme.palette.background.paper, isDarkMode ? 0.52 : 0.82),
                                    borderColor: alpha(theme.palette.divider, 0.72),
                                }}
                            >
                                <Stack direction='row' spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant='caption' sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                            Asset URL
                                        </Typography>
                                        <Link
                                            href={fullUrl}
                                            target='_blank'
                                            rel='noreferrer'
                                            underline='hover'
                                            sx={{ display: 'block', mt: 0.5, wordBreak: 'break-all' }}
                                        >
                                            {fullUrl}
                                        </Link>
                                    </Box>
                                    <Stack direction='row' spacing={0.5}>
                                        <Tooltip title='Copy URL'>
                                            <IconButton
                                                size='small'
                                                onClick={() => navigator.clipboard?.writeText(fullUrl)}
                                                aria-label='Copy image URL'
                                            >
                                                <ContentCopyRoundedIcon fontSize='small' />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title='Open in new tab'>
                                            <IconButton
                                                size='small'
                                                component='a'
                                                href={fullUrl}
                                                target='_blank'
                                                rel='noreferrer'
                                                aria-label='Open image in new tab'
                                            >
                                                <OpenInNewRoundedIcon fontSize='small' />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </Stack>
                            </Paper>
                        ) : null}
                    </Stack>
                </Grid>
                <Grid item size={{ xs: 12, md: 8 }} sx={{
                    height: { xs: 'calc(100% - 320px)', md: '100%' },
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: stageBackground,
                    p: { xs: 1.5, md: 3 },
                    }}>
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: frameBorder,
                            backgroundColor: frameBackground,
                            boxShadow: innerShadow,
                            overflow: 'hidden',
                        }}
                    >
                        <img
                            src={fullUrl}
                            srcSet={fullUrl}
                            alt={item.name}
                            loading="lazy"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                backgroundColor: 'transparent',
                            }}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    </>
}

export default ImageGallery;