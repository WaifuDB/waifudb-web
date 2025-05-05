import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getAPIUrl } from "../helpers/API";
import { getAgeRangeLabel, getBMI, getBMICategory, getBodyType, getBreastBandSize, getCupSizeLabel, getZodiacSign, ShowNotification } from "../helpers/Misc";
import { Box, Button, Card, CardActions, CardContent, CardMedia, Chip, Container, Grid, Typography } from "@mui/material";
import { useAuth } from "../providers/AuthProvider";

function RouteWaifus() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { id } = useParams();
    const { canCreate } = useAuth();

    useEffect(() => {
        if (!id) {
            console.error('ID is required to fetch waifu data');
            return;
        }

        (async () => {
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

                setData(waifuData);
            } catch (error) {
                ShowNotification(error.message, "error");
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Box>
                <Container maxWidth="lg">
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
                                        sx={{ objectFit: 'cover', objectPosition: 'top', backgroundColor: '#f0f0f0'  }}
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
                                                <Button size="small" fullWidth color="primary" component={Link} to={`/waifus/${data.id}/edit`} variant="outlined">
                                                    Edit
                                                </Button>
                                            )
                                        }
                                    </CardActions>
                                </Card>
                            </Grid>
                            <Grid size={9}>
                                <Grid container spacing={2} sx={{ width: '100%' }}>
                                    <Grid item size={{ sx: 12, md: 4 }}>
                                        {GetWaifuStat({ label: "Age", value: data.age ? <>
                                            <Chip label={data.age} size="small" color="primary" variant="outlined" sx={{ mr: 1 }} />
                                            {getAgeRangeLabel(data.age)}
                                        </> : '' })}
                                    </Grid>
                                    <Grid item size={{ sx: 12, md: 4 }}>
                                        {GetWaifuStat({ label: "Birth Date", value: data.birth_date ? <>
                                            {data.birth_date} ({getZodiacSign(data.birth_date)})
                                        </> : '' })}
                                    </Grid>
                                    <Grid item size={{ sx: 12, md: 4 }}>
                                        {GetWaifuStat({ label: "Birth Place", value: data.birth_place })}
                                    </Grid>
                                    <Grid item size={{ sx: 12, md: 3 }}>
                                        {GetWaifuStat({ label: "Weight", value: data.weight ? `${data.weight}kg` : '' })}
                                    </Grid>
                                    <Grid item size={{ sx: 12, md: 3 }}>
                                        {GetWaifuStat({ label: "Height", value: data.height ? `${data.height}cm` : '' })}
                                    </Grid>
                                    <Grid item size={{ sx: 12, md: 3 }}>
                                        {GetWaifuStat({ label: "BMI", value: data.weight && data.height ? <>
                                            {getBMI(data.height, data.weight).toFixed(2)} ({getBMICategory(getBMI(data.height, data.weight))})
                                        </> : '' })}
                                    </Grid>
                                    <Grid item size={{ sx: 12, md: 3 }}>
                                        {GetWaifuStat({ label: "Blood Type", value: data.blood_type ? `${data.blood_type}` : '' })}
                                    </Grid>
                                    <Grid item size={{ sx: 12, md: 2 }}>
                                        {GetWaifuStat({ label: "Cup Size", value: data.cup_size ? <>
                                            <Chip label={getCupSizeLabel(data.cup_size)} size="small" color="primary" variant="outlined" sx={{ mr: 1 }} />
                                            {data.bust ? getBreastBandSize(data.bust, data.cup_size) : ''}{data.cup_size}
                                        </> : '' })}
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
                                        {GetWaifuStat({ label: "Body Type", value: data.height && data.weight && data.bust && data.waist && data.hip
                                            ? getBodyType(data.height, data.weight, data.bust, data.waist, data.hip) : '' })}
                                    </Grid>
                                    <Grid item size={{ md: 12 }}>
                                        {GetWaifuStat({ label: "Description", value: data.description })}
                                    </Grid>
                                    <Grid item size={{ md: 12 }}>
                                        {GetWaifuStat({ label: "Sources", value: data.sources ? data.sources.map((source, index) => (
                                            <Chip key={index} label={source.name} size="small" color="primary" variant="outlined" sx={{ mr: 1 }} component={Link} to={`/sources/${source.id}`} />
                                        )) : ''
                                        })}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </Container>
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