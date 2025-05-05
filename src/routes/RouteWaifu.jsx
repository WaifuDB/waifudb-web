import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getAPIUrl } from "../helpers/API";
import { ShowNotification } from "../helpers/Misc";
import { Box, Card, CardContent, CardMedia, Container, Grid, Typography } from "@mui/material";

function RouteWaifu() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { id } = useParams();

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
                    {/* <h1>{data.name}</h1> */}
                    {/* <img src={data.image_url} alt={data.name} style={{ width: '100%', height: 'auto' }} />
                    <p><strong>JP Name:</strong> {data.jp_name}</p>
                    <p><strong>Age:</strong> {data.age}</p>
                    <p><strong>Birthplace:</strong> {data.birth_place}</p>
                    <p><strong>Birthdate:</strong> {data.birth_date}</p>
                    <p><strong>Height:</strong> {data.height}</p>
                    <p><strong>Weight:</strong> {data.weight}</p>
                    <p><strong>Bust:</strong> {data.bust}</p>
                    <p><strong>Waist:</strong> {data.waist}</p>
                    <p><strong>Hips:</strong> {data.hips}</p>
                    <p><strong>Description:</strong> {data.description}</p>
                    <p><strong>Source:</strong> {data.source}</p> */}
                    <Box>
                        {/* <Typography variant="h6" component="h2" gutterBottom>
                            {data.name}
                        </Typography> */}
                        <Grid container spacing={2}>
                            <Grid size={3}>
                                {/* big image (or grey if the url is null) */}
                                <Card elevation={2}>
                                    <CardMedia
                                        component="img"
                                        image={data.image_url || "https://placehold.co/400"}
                                        alt={data.name}
                                        sx={{ objectFit: 'cover' }}
                                        style={{ width: '100%', height: 'auto', aspectRatio: '1 / 1' }}
                                    />
                                    <CardContent>
                                        <Typography variant="h5" component="div" gutterBottom>
                                            {data.name}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid size={9}>
                                <Grid container spacing={2} sx={{ width: '100%' }}>
                                    <Grid item size={{ sx: 12, md: 6 }}>
                                        {GetWaifuStat({ label: "Birth Place", value: data.birth_place })}
                                    </Grid>
                                    <Grid item size={{ sx: 12, md: 6 }}>
                                        {GetWaifuStat({ label: "Birth Date", value: data.birth_date })}
                                    </Grid>
                                    <Grid item size={{ sx: 12, md: 4 }}>
                                        {GetWaifuStat({ label: "Age", value: data.age })}
                                    </Grid>
                                    <Grid item size={{ sx: 12, md: 4 }}>
                                        {GetWaifuStat({ label: "Weight", value: data.weight })}
                                    </Grid>
                                    <Grid item size={{ sx: 12, md: 4 }}>
                                        {GetWaifuStat({ label: "Height", value: data.height })}
                                    </Grid>
                                    <Grid item size={{ sx: 12, md: 4 }}>
                                        {GetWaifuStat({ label: "Bust", value: data.bust })}
                                    </Grid>
                                    <Grid item size={{ sx: 12, md: 4 }}>
                                        {GetWaifuStat({ label: "Waist", value: data.waist })}
                                    </Grid>
                                    <Grid item size={{ sx: 12, md: 4 }}>
                                        {GetWaifuStat({ label: "Hips", value: data.hips })}
                                    </Grid>
                                    <Grid item size={{ sx: 12 }}>
                                        {GetWaifuStat({ label: "Description", value: data.description })}
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
            <Typography variant="body2" color="text.secondary">{value}</Typography>
        </>
    );
}

export default RouteWaifu;