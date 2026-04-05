import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getAPIUrl } from "../helpers/API";
import { Box, Card, CardActionArea, CardContent, CardMedia, Grid, Stack, Tab, Tabs, Typography } from "@mui/material";
import { getGenderLabel, getRelationshipType, reprocessRelationshipsForChart, TabPanel, tabProps } from "../helpers/Misc";
import ForceGraph2D from 'react-force-graph-2d';
import { useResizeDetector } from "react-resize-detector";
import ImageGallery from "../components/ImageGallery";

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

const MIN_NODE_SIZE = 16;
const MAX_NODE_SIZE = 32;
const NODE_LABEL_ZOOM_THRESHOLD = 0.75;
const LINK_LABEL_ZOOM_THRESHOLD = 1.1;
const MIN_LINK_FONT_SIZE = 3;
const PLACEHOLDER_IMAGE_URL = "https://placehold.co/400";
const DASHED_LINK_PATTERN = [4, 2];
const SOURCE_TABS = {
    [0]: {
        label: "Characters",
        url_key: "characters",
    },
    [1]: {
        label: "Gallery",
        url_key: "gallery",
    },
    [2]: {
        label: "Relationships",
        url_key: "relationships",
    }
};

const GRAPH_LABEL_MEASURE_CONTEXT = typeof document !== 'undefined'
    ? document.createElement('canvas').getContext('2d')
    : null;

function getCharacterImageUrl(remoteImageId) {
    return remoteImageId
        ? `https://cdn.kirino.sh/i/${remoteImageId}.png`
        : PLACEHOLDER_IMAGE_URL;
}

function measureLabelWidth(label) {
    if (!GRAPH_LABEL_MEASURE_CONTEXT || !label) {
        return 1;
    }

    GRAPH_LABEL_MEASURE_CONTEXT.font = '1px Sans-Serif';
    return GRAPH_LABEL_MEASURE_CONTEXT.measureText(label).width || 1;
}

function getImageCrop(image) {
    const width = image?.naturalWidth || image?.width || 0;
    const height = image?.naturalHeight || image?.height || 0;

    if (!width || !height) {
        return null;
    }

    if (width > height) {
        const sourceWidth = height;
        return {
            sx: (width - sourceWidth) / 2,
            sy: 0,
            sWidth: sourceWidth,
            sHeight: height,
        };
    }

    const sourceHeight = width;
    return {
        sx: 0,
        sy: 0,
        sWidth: width,
        sHeight: sourceHeight,
    };
}

function RouteSourcesObject() {
    const { id, tab } = useParams();
    const fgRef = useRef();
    const { width, ref: containerRef } = useResizeDetector();
    const [data, setData] = useState(null);
    const [relationshipData, setRelationshipData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();

    const loadSource = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${getAPIUrl()}/sources/get/${id}`);
            if (response.status !== 200) {
                throw new Error('Failed to fetch sources data');
            }
            const sourcesData = response.data;
            if (!sourcesData) {
                throw new Error('No data found for the sources');
            }

            //order characters by amount of relationships
            sourcesData.characters.sort((a, b) => (b.relationships?.length || 0) - (a.relationships?.length || 0));

            setData(sourcesData);

            //reprocess relationship data (for chart)
            let _relData = {
                characters: [
                    // { id: character.id, name: character.name}
                ],
                relationships: [
                    // { from: character.id, to: character.id, labels: { forward: "brother", reverse: "sister" }, ... extra data irrelevant for the example }}
                ]
            }

            let _relationships = [];
            if (sourcesData.characters && sourcesData.characters.length > 0) {
                for (const character of sourcesData.characters) {
                    const imageUrl = getCharacterImageUrl(character.remote_image_id);
                    let image = new Image();
                    image.crossOrigin = "anonymous"; // to avoid CORS issues
                    image.decoding = 'async';
                    image.onload = () => {
                        fgRef.current?.refresh();
                    };
                    image.onerror = () => {
                        fgRef.current?.refresh();
                    };
                    image.src = imageUrl;

                    const genderLabel = getGenderLabel(character.gender);

                    _relData.characters.push({
                        id: character.id,
                        gender: character.gender,
                        name: character.name,
                        age: character.age,
                        displayLabel: `${genderLabel.symbol}${character.name}${character.age ? ` (${character.age})` : ''}`,
                        image_url: imageUrl,
                        image: image,
                    });
                    if (character.relationships && character.relationships.length > 0) {
                        character.relationships.forEach((relationship) => {
                            let relationship_type = relationship.relationship_type;
                            let reciprocal_relationship_type = relationship.reciprocal_relationship_type;

                            let relationshipType = relationship.relationship_type ? getRelationshipType(relationship.relationship_type) : getRelationshipType(relationship.reciprocal_relationship_type);

                            _relationships.push({
                                from: relationship.from_id,
                                to: relationship.to_id,
                                labels: { forward: relationship_type, reverse: reciprocal_relationship_type },
                                color: relationshipType.color,
                                type: relationshipType.type,
                                same_labels: relationship_type === reciprocal_relationship_type,
                                visualize: relationship.visualize,
                            });
                        });
                    }
                }

                _relationships = reprocessRelationshipsForChart(_relationships).map((relationship) => ({
                    ...relationship,
                    label_width: measureLabelWidth(relationship.label),
                }));
                let relationshipCounts = {};
                _relationships.forEach((relationship) => {
                    if (relationship.visualize === false) return;
                    let source = relationship.source;
                    let target = relationship.target;
                    if (!relationshipCounts[source]) {
                        relationshipCounts[source] = 0;
                    }
                    if (!relationshipCounts[target]) {
                        relationshipCounts[target] = 0;
                    }

                    relationshipCounts[source]++;
                    relationshipCounts[target]++;
                });

                let maxRelationshipCount = Math.max(...Object.values(relationshipCounts), 1);

                _relData.characters.forEach((character) => {
                    let relationshipCount = relationshipCounts[character.id] || 0;
                    character.relationship_count = relationshipCount;
                    character.size = Math.max(MIN_NODE_SIZE, Math.min(MAX_NODE_SIZE, (MAX_NODE_SIZE - MIN_NODE_SIZE) * (relationshipCount / maxRelationshipCount) + MIN_NODE_SIZE));
                });


                _relData.relationships = _relationships;

                //automatically add curvature to the relationships
                //graph doesnt do it automatically, so we have to do it manually (every extra relationship between the same to/from is 0.1 more curvature compared to the previous one)

                const relationshipCurvature = {};
                _relData.relationships.forEach((relationship) => {
                    if (relationship.visualize === false) return;
                    const key = `${relationship.source}-${relationship.target}`;
                    if (!relationshipCurvature[key]) {
                        relationshipCurvature[key] = 0;
                    }
                    relationshipCurvature[key] += 0.1;
                    relationship.curvature = relationshipCurvature[key];
                });
                _relData.maxRelationshipCount = maxRelationshipCount;
                _relData.graphData = {
                    nodes: _relData.characters.filter((node) => node.relationship_count > 0),
                    links: _relData.relationships.filter((link) => link.visualize !== false),
                };
            } else {
                _relData.graphData = { nodes: [], links: [] };
            }

            setRelationshipData(_relData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (tab === undefined) {
            //if no tab is specified, set it to 0
            navigate(`/sources/${id}/${SOURCE_TABS[0].url_key}`);
            return;
        }
        //set the active tab based on the URL
        const newActiveTab = Number(Object.keys(SOURCE_TABS).find(key => SOURCE_TABS[key].url_key === tab));
        if (newActiveTab !== undefined) {
            setActiveTab(newActiveTab);
        } else {
            //if the tab is not found, set it to 0
            setActiveTab(0);
        }

    }, [id, navigate, tab]);

    const changeTab = (newValue) => {
        const newTab = SOURCE_TABS[newValue].url_key;
        navigate(`/sources/${id}/${newTab}`);
    }

    useEffect(() => {
        //increase distance between connected nodes
        if (fgRef.current) {
            fgRef.current.d3Force('charge')
                .strength(-450)
                .distanceMax(220)
                .distanceMin(40);
        }
    }, [relationshipData, width]);

    useEffect(() => {
        (async () => {
            await loadSource();
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
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={(e, newValue) => changeTab(newValue)}>
                    {/* <Tab label="Characters" {...tabProps(0)} />
                    <Tab label="Gallery" {...tabProps(1)} /> */}
                    {
                        Object.keys(SOURCE_TABS).map((key) => (
                            <Tab
                                key={key}
                                label={SOURCE_TABS[key].label}
                                {...tabProps(key)}
                            />
                        ))
                    }
                </Tabs>
            </Box>
            <TabPanel value={activeTab} index={0}>
                <Box>
                    {/* Characters */}
                    <Typography variant="h6" component="h2" gutterBottom>Characters ({data.characters.length})</Typography>
                    <Grid container spacing={2}>
                        {
                            data.characters.map((character) => (
                                <Grid item size={{ md: 12 / 8 }} key={character.id}>
                                    <Card elevation={2}>
                                        <CardActionArea
                                            component={Link}
                                            to={`/characters/${character.id}`}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <CardMedia
                                                component="img"
                                                image={character.remote_image_id ? `https://cdn.kirino.sh/i/${character.remote_image_id}.png` : "https://placehold.co/400"}
                                                alt={character.name}
                                                sx={{ objectFit: 'cover', objectPosition: 'top', backgroundColor: '#f0f0f0' }}
                                                style={{ width: '100%', height: 'auto', aspectRatio: '1 / 1.25' }}
                                            />
                                            <CardContent sx={{
                                                //reduced padding for the content
                                                padding: '4px',
                                            }}>
                                                <Typography variant="body1" component="div" gutterBottom>
                                                    {getGenderLabel(character.gender).symbol} {character.name}
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))
                        }
                    </Grid>
                </Box>
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
                <ImageGallery image_data={data.images} />
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
                <Box ref={containerRef} sx={{
                    maxWidth: '100%',
                }}>
                    <Typography variant="h6" component="h2" gutterBottom>Relationships ({relationshipData?.relationships?.length || 0})</Typography>
                    {
                        width ? <>
                            <ForceGraph2D
                                ref={fgRef}
                                width={width}
                                graphData={relationshipData?.graphData || { nodes: [], links: [] }}
                                cooldownTicks={80}
                                d3AlphaDecay={0.08}
                                d3VelocityDecay={0.35}
                                nodeLabel="name"
                                nodeAutoColorBy="group"
                                nodeCanvasObject={(node, ctx, globalScale) => {
                                    const size = node.size || MIN_NODE_SIZE;
                                    const positionX = node.x - size / 2;
                                    const positionY = node.y - size / 2;

                                    ctx.save();
                                    ctx.beginPath();
                                    ctx.arc(node.x, node.y, size / 2, 0, Math.PI * 2, true);
                                    ctx.closePath();
                                    ctx.clip();
                                    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                                    ctx.fillRect(positionX, positionY, size, size);

                                    if (!node.image_crop && node.image?.naturalWidth && node.image?.naturalHeight) {
                                        node.image_crop = getImageCrop(node.image);
                                    }

                                    if (node.image_crop) {
                                        ctx.drawImage(
                                            node.image,
                                            node.image_crop.sx,
                                            node.image_crop.sy,
                                            node.image_crop.sWidth,
                                            node.image_crop.sHeight,
                                            positionX,
                                            positionY,
                                            size,
                                            size,
                                        );
                                    }

                                    ctx.restore();

                                    if (globalScale < NODE_LABEL_ZOOM_THRESHOLD) return;

                                    const fontSize = Math.max(10 / globalScale, 4);
                                    ctx.font = `${fontSize}px Sans-Serif`;
                                    ctx.fillStyle = 'white';
                                    ctx.textAlign = 'center';
                                    ctx.textBaseline = 'middle';
                                    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
                                    ctx.shadowBlur = 6 / globalScale;
                                    ctx.fillText(node.displayLabel, node.x, node.y + (size / 2) + (fontSize * 0.8));
                                    ctx.shadowBlur = 0;
                                }}
                                onNodeClick={(node) => {
                                    navigate(`/characters/${node.id}`);
                                }}
                                linkColor={(link) => link.color || 'white'}
                                linkWidth={1}
                                linkCurvature="curvature"
                                zoomToFit={true}
                                nodeVal={(node) => node.size || MIN_NODE_SIZE}
                                onNodeDragEnd={(node) => {
                                    node.fx = node.x;
                                    node.fy = node.y;
                                }}
                                linkDirectionalArrowLength={link => link.same_labels ? 0 : 4}
                                linkDirectionalArrowRelPos={1}
                                linkDirectionalArrowColor={'color'}
                                linkCanvasObjectMode={() => 'after'}
                                linkCanvasObject={(link, ctx, globalScale) => {
                                    if (globalScale < LINK_LABEL_ZOOM_THRESHOLD || !link.label) {
                                        return;
                                    }

                                    const MAX_FONT_SIZE = 12 / globalScale;
                                    const LABEL_NODE_MARGIN = 8 / globalScale;

                                    const start = link.source;
                                    const end = link.target;

                                    if (typeof start !== 'object' || typeof end !== 'object') return;

                                    const relLink = { x: end.x - start.x, y: end.y - start.y };
                                    const distance = Math.hypot(relLink.x, relLink.y);
                                    if (!distance) {
                                        return;
                                    }

                                    const curvature = Number(link.curvature) || 0.5;
                                    const textPos = {
                                        x: (start.x + end.x) / 2 + (relLink.y * curvature * 0.5),
                                        y: (start.y + end.y) / 2 - (relLink.x * curvature * 0.5),
                                    };

                                    const maxTextLength = distance - LABEL_NODE_MARGIN * 2;
                                    if (maxTextLength <= 0) {
                                        return;
                                    }

                                    let textAngle = Math.atan2(relLink.y, relLink.x);
                                    if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
                                    if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);

                                    const fontSize = Math.min(MAX_FONT_SIZE, maxTextLength / (link.label_width || 1));
                                    if (fontSize < MIN_LINK_FONT_SIZE) {
                                        return;
                                    }

                                    ctx.font = `${fontSize}px Sans-Serif`;

                                    ctx.save();
                                    ctx.translate(textPos.x, textPos.y);
                                    ctx.rotate(textAngle);

                                    ctx.textAlign = 'center';
                                    ctx.textBaseline = 'middle';
                                    ctx.fillStyle = link.color || 'white';
                                    ctx.fillText(link.label, 0, 0);
                                    ctx.restore();
                                }}
                                linkLineDash={link => link.dashed ? DASHED_LINK_PATTERN : undefined}
                            />
                        </> :
                            <Typography variant="body1" component="p">No relationships found</Typography>
                    }
                </Box>
            </TabPanel>
        </>
    );
}

export default RouteSources;