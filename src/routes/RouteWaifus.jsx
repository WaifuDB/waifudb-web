import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getAPIUrl } from "../helpers/API";
import { getAgeRangeLabel, getBMI, getBMICategory, getBodyType, getBreastBandSize, getCupSizeLabel, getGenderLabel, getRelationshipType, getZodiacSign, MODAL_STYLE, ShowNotification, sortRelationships } from "../helpers/Misc";
import { Box, Button, Card, CardActions, CardContent, CardMedia, Chip, Container, Divider, Grid, IconButton, ImageList, ImageListItem, Modal, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { useAuth } from "../providers/AuthProvider";
import AddIcon from '@mui/icons-material/Add';
import WaifuRelationshipEditor from "../components/WaifuRelationshipEditor";

function RouteWaifus() {
    const [data, setData] = useState(null);
    const [displayableRelationships, setDisplayableRelationships] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { id } = useParams();
    const { canCreate } = useAuth();

    const [isRelationshipEditOpen, setIsRelationshipEditOpen] = useState(false);

    const onReload = async () => {
        //split "id" by dash and only take the first part
        const waifuId = id.split('-')[0];
        try {
            const response = await axios.get(`${getAPIUrl()}/characters/get/${waifuId}`);
            if (response.status !== 200) {
                throw new Error('Failed to fetch waifu data');
            }
            const waifuData = response.data;
            if (!waifuData) {
                throw new Error('No data found for the given ID');
            }
            //update the ID section of the URL to ${waifuId}-${waifuData.name} (add dashes and lower in the name) without actually reloading the page
            const newUrl = window.location.href.split('/').slice(0, -1).join('/') + '/' + waifuId + '-' + waifuData.name.toLowerCase().replace(/ /g, '-');
            window.history.replaceState(null, '', newUrl);

            //group relationships by target character id
            const relationships = {};
            waifuData.relationships.forEach((relationship) => {
                let targetId = relationship.to_id == waifuData.id ? relationship.from_id : relationship.to_id;
                if (!relationships[targetId]) {
                    relationships[targetId] = {
                        character: relationship.character,
                        types: []
                    };
                }
                const _type = relationship.to_id == waifuData.id ? relationship.relationship_type : relationship.reciprocal_relationship_type;
                relationships[targetId].types.push({
                    type: _type,
                    color: getRelationshipType(_type).color
                    //todo; potential descriptions / contexts
                });
            });
            setDisplayableRelationships(relationships);
            setData(waifuData);
        } catch (error) {
            ShowNotification(error.message, "error");
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
            setIsRelationshipEditOpen(false);
        }
    }

    useEffect(() => {
        if (!id) {
            console.error('ID is required to fetch waifu data');
            return;
        }

        onReload();
    }, [id]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {
                canCreate() && (
                    <>
                        {/* contains edit modals for stuff like relationships */}
                        <Modal
                            open={isRelationshipEditOpen}
                            onClose={() => setIsRelationshipEditOpen(false)}
                        >
                            <Paper sx={MODAL_STYLE}>
                                <WaifuRelationshipEditor onReload={onReload} primaryCharacter={data} />
                            </Paper>
                        </Modal>
                    </>
                )
            }
            <Box>
                <Box>
                    <Grid container spacing={2}>
                        <Grid size={3}>
                            {/* big image (or grey if the url is null) */}
                            <Card elevation={2}>
                                <CardMedia
                                    component="img"
                                    image={data.image_url || "https://placehold.co/400"}
                                    alt={data.name}
                                    //show top side of the image
                                    sx={{ objectFit: 'cover', objectPosition: 'top', backgroundColor: '#f0f0f0' }}
                                    style={{ width: '100%', height: 'auto', aspectRatio: '1 / 1.25' }}
                                />
                                <CardContent>
                                    <Typography variant="h5" component="div" gutterBottom>
                                        {data.name}
                                    </Typography>
                                    {
                                        data.jp_name && (
                                            <Typography variant="body1" gutterBottom>
                                                {data.jp_name}
                                            </Typography>
                                        )
                                    }
                                </CardContent>
                                <CardActions>
                                    {/* <Button size="small" color="primary">
                                            Share
                                        </Button> */}
                                    {
                                        canCreate() && (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                                                <Button size="small" fullWidth color="primary" component={Link} to={`/characters/${data.id}/edit`} variant="contained">
                                                    Edit
                                                </Button>
                                                <Button size="small" fullWidth color="primary" component={Link} to={`/images/new`} variant="outlined">
                                                    Add Image
                                                </Button>
                                            </Box>
                                        )
                                    }
                                </CardActions>
                            </Card>
                            <Paper sx={{ mt: 2, p: 2 }} elevation={2}>
                                <Typography variant="h6" component="div" gutterBottom>
                                    Relationships
                                    {
                                        canCreate() && (
                                            <IconButton size="small" color="primary" variant="outlined" sx={{ ml: 2 }} onClick={() => setIsRelationshipEditOpen(true)}>
                                                <AddIcon />
                                            </IconButton>
                                        )
                                    }
                                </Typography>
                                {
                                    data.relationships && data.relationships.length > 0 ? <>
                                        <Stack spacing={1}>
                                            {
                                                displayableRelationships && Object.keys(displayableRelationships).length > 0 ? Object.keys(displayableRelationships).map((key) => {
                                                    let targetCharacter = displayableRelationships[key].character;
                                                    //count excluding .type equal to null
                                                    let countRelationships = 0;
                                                    displayableRelationships[key].types.forEach((relationship) => {
                                                        if (relationship.type != null) {
                                                            countRelationships++;
                                                        }
                                                    });

                                                    if (countRelationships == 0) {
                                                        return null;
                                                    }

                                                    return (
                                                        <>
                                                            <Typography variant="body1" component="div" gutterBottom key={targetCharacter.id}>
                                                                {getGenderLabel(targetCharacter.gender).symbol}
                                                                <Link to={`/characters/${targetCharacter.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                                    {targetCharacter.name}
                                                                </Link>
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                                {
                                                                    displayableRelationships[key].types.map((relationship, index) => {
                                                                        if (relationship.type == null) {
                                                                            return null;
                                                                        }
                                                                        let relationshipLabel = relationship.type;
                                                                        //uppercase the first letter of the relationship label
                                                                        relationshipLabel = relationshipLabel?.charAt(0).toUpperCase() + relationshipLabel?.slice(1);
                                                                        relationshipLabel = relationshipLabel ?? 'Unknown';
                                                                        return (
                                                                            <Tooltip key={index} title={`${targetCharacter.name} is the ${relationshipLabel.toLowerCase()} of ${data.name}`} placement="top" arrow>
                                                                                <Chip key={index} label={relationshipLabel} size="small" variant="outlined" sx={{
                                                                                    color: relationship.color,
                                                                                }} />
                                                                            </Tooltip>
                                                                        )
                                                                    })
                                                                }
                                                            </Box>
                                                            <Divider sx={{ mb: 1 }} />
                                                        </>
                                                    )
                                                }) : <Typography variant="body2" color="text.secondary" sx={{
                                                    fontStyle: 'italic',
                                                    color: 'gray',
                                                }}>No relationships found</Typography>
                                            }
                                        </Stack>
                                    </> : <Typography variant="body2" color="text.secondary" sx={{
                                        fontStyle: 'italic',
                                        color: 'gray',
                                    }}>No relationships found</Typography>
                                }
                            </Paper>
                        </Grid>
                        <Grid size={9}>
                            <Grid container spacing={2} sx={{ width: '100%' }}>
                                <Grid item size={{ sx: 12, md: 3 }}>
                                    {GetWaifuStat({
                                        label: "Age", value: data.age ? <>
                                            <Chip label={data.age} size="small" color="primary" variant="outlined" sx={{ mr: 1 }} />
                                            {getAgeRangeLabel(data.age)}
                                        </> : ''
                                    })}
                                </Grid>
                                <Grid item size={{ sx: 12, md: 3 }}>
                                    {GetWaifuStat({
                                        label: "Gender", value: data.gender ? <>
                                            {getGenderLabel(data.gender).symbol} {getGenderLabel(data.gender).label}
                                        </> : ''
                                    })}
                                </Grid>
                                <Grid item size={{ sx: 12, md: 3 }}>
                                    {GetWaifuStat({
                                        label: "Birth Date", value: data.birth_date ? <>
                                            {data.birth_date} ({getZodiacSign(data.birth_date)})
                                        </> : ''
                                    })}
                                </Grid>
                                <Grid item size={{ sx: 12, md: 3 }}>
                                    {GetWaifuStat({ label: "Birth Place", value: data.birth_place })}
                                </Grid>
                                <Grid item size={{ sx: 12, md: 3 }}>
                                    {GetWaifuStat({
                                        label: "Weight", value: data.weight ?
                                            // `${data.weight}kg${data.body_fat?` (${data.body_fat}% body fat)`:''}` 
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">{data.weight}kg</Typography>
                                                {data.body_fat ? <Chip label={`${data.body_fat}% body fat`} size="small" color="primary" variant="outlined" sx={{ ml: 1 }} /> : ''}
                                            </Box>
                                            : ''
                                    })}
                                </Grid>
                                <Grid item size={{ sx: 12, md: 3 }}>
                                    {GetWaifuStat({ label: "Height", value: data.height ? `${data.height}cm` : '' })}
                                </Grid>
                                <Grid item size={{ sx: 12, md: 3 }}>
                                    {GetWaifuStat({
                                        label: "BMI", value: data.weight && data.height ? <>
                                            {getBMI(data.height, data.weight).toFixed(2)} ({getBMICategory(getBMI(data.height, data.weight))})
                                        </> : ''
                                    })}
                                </Grid>
                                <Grid item size={{ sx: 12, md: 3 }}>
                                    {GetWaifuStat({ label: "Blood Type", value: data.blood_type ? `${data.blood_type}` : '' })}
                                </Grid>
                                <Grid item size={{ sx: 12, md: 2 }}>
                                    {GetWaifuStat({
                                        label: "Cup Size", value: data.cup_size ? <>
                                            <Chip label={getCupSizeLabel(data.cup_size)} size="small" color="primary" variant="outlined" sx={{ mr: 1 }} />
                                            {data.bust ? getBreastBandSize(data.bust, data.cup_size) : ''}{data.cup_size}
                                        </> : ''
                                    })}
                                </Grid>
                                <Grid item size={{ sx: 12, md: 2 }}>
                                    {GetWaifuStat({ label: "Bust", value: data.bust ? `${data.bust}cm` : '' })}
                                </Grid>
                                <Grid item size={{ sx: 12, md: 2 }}>
                                    {GetWaifuStat({ label: "Waist", value: data.waist ? `${data.waist}cm` : '' })}
                                </Grid>
                                <Grid item size={{ sx: 12, md: 2 }}>
                                    {GetWaifuStat({ label: "Hips", value: data.hip ? `${data.hip}cm` : '' })}
                                </Grid>
                                <Grid item size={{ sx: 12, md: 2 }}>
                                    {GetWaifuStat({
                                        label: "Body Type", value: data.height && data.weight && data.bust && data.waist && data.hip
                                            ? getBodyType(data.height, data.weight, data.bust, data.waist, data.hip) : ''
                                    })}
                                </Grid>
                                <Grid item size={{ md: 12 }}>
                                    {GetWaifuStat({
                                        label: "Sources", value: data.sources ? data.sources.map((source, index) => (
                                            <Chip key={index} label={source.name} size="small" color="primary" variant="outlined" sx={{ mr: 1 }} component={Link} to={`/sources/${source.id}`} />
                                        )) : ''
                                    })}
                                </Grid>
                                <Grid item size={{ md: 12 }}>
                                    {GetWaifuStat({ label: "Description", value: data.description })}
                                </Grid>
                                <Grid item size={{ md: 12 }}>
                                    <Typography variant="body1" gutterBottom>Gallery
                                        {
                                            data.images && data.images.length > 0 ? <Chip label={`${data.images.length}`} size="small" color="primary" variant="outlined" sx={{ ml: 1 }} /> : ''
                                        }
                                    </Typography>
                                    {
                                        data.images && data.images.length > 0 ? <>
                                            <ImageList
                                                sx={{ width: '100%', height: 'auto' }}
                                                variant="masonry"
                                                cols={6}
                                            >
                                                {
                                                    data.images.map((item) => (
                                                        <ImageListItem key={item.id} sx={{ width: '100%', height: 'auto' }}>
                                                            <img
                                                                // src={`${item.image_url}?fit=crop&auto=format`}
                                                                // srcSet={`${item.image_url}?fit=crop&auto=format&dpr=2 2x`}
                                                                src={`${item.image_url}?w=500&h=500&fit=crop&auto=format`}
                                                                srcSet={`${item.image_url}?w=500&h=500&fit=crop&auto=format&dpr=2 2x`}
                                                                alt={item.name}
                                                                loading="lazy"
                                                                style={{
                                                                    backgroundColor: '#f0f0f0',
                                                                    borderRadius: '4px',
                                                                }}
                                                            />
                                                        </ImageListItem>
                                                    ))
                                                }
                                            </ImageList>
                                        </> : <Typography variant="body2" color="text.secondary" sx={{
                                            fontStyle: 'italic',
                                            color: 'gray',
                                        }}>No images found</Typography>
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </>
    )
}

function GetWaifuStat({ label, value }) {
    return (
        <>
            <Typography variant="body1" gutterBottom>{label}</Typography>
            {
                value ?
                    <Typography variant="body2" color="text.secondary">{value}</Typography>
                    : <Typography variant="body2" color="text.secondary" sx={{
                        fontStyle: 'italic',
                        color: 'gray',
                    }}>Not available</Typography>
            }
        </>
    );
}

export default RouteWaifus;