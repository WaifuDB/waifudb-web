import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getAPIUrl } from "../helpers/API";
import { Box, Card, CardActionArea, CardContent, CardMedia, Grid, Stack, Typography } from "@mui/material";

function RouteSources() {
    const { id } = useParams();

    if (id) {
        return <RouteSourcesObject />;
    } else {
        return <RouteSourcesList />;
    }
}

function RouteSourcesList() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get(`${getAPIUrl()}/sources/get/all`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch sources data');
                }
                const sourcesData = response.data;
                if (!sourcesData) {
                    throw new Error('No data found for the sources');
                }

                //order the sources by name
                sourcesData.sort((a, b) => a.name.localeCompare(b.name));

                //split the sources by first character, so they are grouped and sorted alphabetically
                const groupedSources = sourcesData.reduce((acc, source) => {
                    const firstChar = source.name.charAt(0).toUpperCase();
                    if (!acc[firstChar]) {
                        acc[firstChar] = [];
                    }
                    acc[firstChar].push(source);
                    return acc;
                }, {});
                setData(groupedSources);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    if (isLoading || !data) {
        return <div>Loading...</div>;
    }

    return <>
        <Typography variant="h5" component="h1" gutterBottom>Sources ({Object.keys(data).length})</Typography>
        <Stack spacing={2}>
            {
                Object.keys(data).map((key) => (
                    <div key={key}>
                        <Typography variant="h6" component="h2">{key}</Typography>
                        <Stack direction="column" spacing={1}>
                            {
                                data[key].map((source) => (
                                    <Link key={source.id} to={`/sources/${source.id}`} style={{ textDecoration: 'none' }}>
                                        <Typography variant="body1" component="p">{source.name} ({source.characters?.length})</Typography>
                                    </Link>
                                ))
                            }
                        </Stack>
                    </div>
                ))
            }
        </Stack>
    </>
}

function RouteSourcesObject() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get(`${getAPIUrl()}/sources/get/${id}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch sources data');
                }
                const sourcesData = response.data;
                if (!sourcesData) {
                    throw new Error('No data found for the sources');
                }
                setData(sourcesData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [id]);

    if (isLoading || !data) {
        return <div>Loading...</div>;
    }

    if (!data) {
        return <div>Source not found</div>;
    }

    return (
        <>
            <Typography variant="h5" component="h1" gutterBottom>{data.name}</Typography>
            <Box>
                {/* Characters */}
                <Typography variant="h6" component="h2" gutterBottom>Characters ({data.characters.length})</Typography>
                <Grid container spacing={2}>
                    {
                        data.characters.map((character) => (
                            <Grid item size={{ md: 2 }} key={character.id}>
                                <Card elevation={2}>
                                    <CardActionArea
                                        component={Link}
                                        to={`/waifus/${character.id}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <CardMedia
                                            component="img"
                                            image={character.image_url || "https://placehold.co/400"}
                                            alt={character.name}
                                            sx={{ objectFit: 'cover', objectPosition: 'top', backgroundColor: '#f0f0f0' }}
                                            style={{ width: '100%', height: 'auto', aspectRatio: '1 / 1.25' }}
                                        />
                                        <CardContent>
                                            <Typography variant="body1" component="div" gutterBottom>
                                                {character.name}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))
                    }
                </Grid>
            </Box>
        </>
    );
}

export default RouteSources;