import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getAPIUrl } from "../helpers/API";
import { Box, Card, CardActionArea, CardContent, CardMedia, Grid, Stack, Typography } from "@mui/material";
import { getGenderLabel, getRelationshipType, reprocessRelationshipsForChart } from "../helpers/Misc";
import ForceGraph2D from 'react-force-graph-2d';
import { useResizeDetector } from "react-resize-detector";
import { fit } from "object-fit-math";

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
function RouteSourcesObject() {
    const { id } = useParams();
    const fgRef = useRef();
    const { width, ref: containerRef } = useResizeDetector();
    const [data, setData] = useState(null);
    const [relationshipData, setRelationshipData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        //increase distance between connected nodes
        if (fgRef.current) {
            fgRef.current.d3Force('charge')
                .strength(-600)
                .distanceMax(300)
                .distanceMin(50);
        }
    }, [fgRef.current]);

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
                    // sourcesData.characters.forEach((character) => {
                    for await (const character of sourcesData.characters) {
                        let image = new Image();
                        image.src = character.image_url || "https://placehold.co/400";
                        image.crossOrigin = "anonymous"; // to avoid CORS issues

                        // maxRelationshipCount = Math.max(maxRelationshipCount, character.relationships.length || 0);
                        _relData.characters.push({
                            id: character.id,
                            gender: character.gender,
                            name: character.name,
                            image_url: character.image_url,
                            image: image,
                            // relationship_count: character.relationships.length,
                            // size: Math.max(MIN_NODE_SIZE, Math.min(MAX_NODE_SIZE, (MAX_NODE_SIZE - MIN_NODE_SIZE) * (character.relationships.length / maxRelationshipCount) + MIN_NODE_SIZE)),
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
                    };

                    
                    _relationships = reprocessRelationshipsForChart(_relationships);
                    let relationshipCounts = {};
                    _relationships.forEach((relationship) => {
                        if(relationship.visualize === false) return;
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

                    let maxRelationshipCount = Math.max(...Object.values(relationshipCounts));
                    console.log(relationshipCounts);

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
                        if(relationship.visualize === false) return;
                        const key = `${relationship.source}-${relationship.target}`;
                        if (!relationshipCurvature[key]) {
                            relationshipCurvature[key] = 0;
                        }
                        relationshipCurvature[key] += 0.1;
                        relationship.curvature = relationshipCurvature[key];
                    });
                    _relData.maxRelationshipCount = maxRelationshipCount;
                }

                setRelationshipData(_relData);
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
                            <Grid item size={{ md: 12 / 8 }} key={character.id}>
                                <Card elevation={2}>
                                    <CardActionArea
                                        component={Link}
                                        to={`/characters/${character.id}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <CardMedia
                                            component="img"
                                            image={character.image_url || "https://placehold.co/400"}
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
                <Box ref={containerRef} sx={{
                    maxWidth: '100%',
                }}>
                    <Typography variant="h6" component="h2" gutterBottom>Relationships ({relationshipData?.relationships?.length || 0})</Typography>
                    {
                        width ? <>
                            <ForceGraph2D
                                ref={fgRef}
                                width={width}
                                graphData={{
                                    // nodes: relationshipData?.characters || [],
                                    //filter out where nodes[x].relationship_count === 0
                                    nodes: relationshipData?.characters?.filter(node => node.relationship_count > 0) || [],
                                    //Duplicate links for both directions
                                    // links: relationshipData?.relationships || [],
                                    //filter out where links[x].visualize === false
                                    links: relationshipData?.relationships?.filter(link => link.visualize !== false) || [],
                                }}
                                nodeLabel="name"
                                nodeAutoColorBy="group"
                                nodeCanvasObject={(node, ctx, globalScale) => {
                                    //use globalScale, but reduce the scaling
                                    //1 = 1
                                    //0.5 = 0.75
                                    //...
                                    //2 = 1.5
                                    //...
                                    let adjustedGlobalScale = (globalScale * 2) / globalScale;
                                    const size = (node.size || 16) / adjustedGlobalScale * 2;

                                    // const size = 28;
                                    // ctx.drawImage(node.image, node.x - size / 2, node.y - size / 2, size, size);

                                    let maxRes = { width: size, height: size };
                                    let curRes = { width: node.image.width, height: node.image.height };

                                    //emulate the "object-fit: cover" property (so the image fills the desired maxWidth and maxHeight (it can be bigger, but the smallest side will equal the maxWidth or maxHeight))
                                    //scale up if either side is smaller than the maxWidth or maxHeight
                                    let fittedRes = fit(maxRes, curRes, 'cover');

                                    let posX = node.x - fittedRes.width / 2;
                                    // let posY = node.y - height / 2;
                                    //align with top of the image instead of center (most images are taller and are portraits, we want to capture the face)
                                    let posY = node.y - size / 2;

                                    let textPosX = node.x;
                                    let textPosY = node.y + size / 2;

                                    // ctx.drawImage(node.image, posX, posY, width, height);

                                    //mask the image to a circle
                                    ctx.save();
                                    ctx.beginPath();
                                    ctx.arc(node.x, node.y, size / 2, 0, Math.PI * 2, true);
                                    ctx.closePath();
                                    ctx.clip();
                                    //draw light gray behind it
                                    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                                    ctx.fillRect(node.x - size / 2, node.y - size / 2, size, size);
                                    //draw the image
                                    ctx.drawImage(node.image, posX, posY, fittedRes.width, fittedRes.height);
                                    ctx.restore();

                                    //dont draw if zoomed out too much
                                    if (globalScale < 0.5) return;

                                    const fontSize = (node.size || 16) / adjustedGlobalScale * 0.5;
                                    ctx.font = `${fontSize}px Sans-Serif`;

                                    const label = `${getGenderLabel(node.gender).symbol}${node.name}`;

                                    ctx.fillStyle = 'white';
                                    ctx.shadowColor = 'black';
                                    ctx.shadowBlur = 2 / adjustedGlobalScale;
                                    ctx.lineWidth = 1 / adjustedGlobalScale;
                                    ctx.strokeText(label, textPosX, textPosY + 10);
                                    ctx.shadowColor = 0;

                                    ctx.textAlign = 'center';
                                    ctx.textBaseline = 'middle';
                                    ctx.fillText(label, textPosX, textPosY + 10);
                                    ctx.restore();
                                }}
                                onNodeClick={(node) => {
                                    navigate(`/characters/${node.id}`);
                                }}
                                linkColor={(link) => link.color || 'white'}
                                linkWidth={1}
                                linkCurvature="curvature"
                                // linkDirectionalArrowLength={6}
                                zoomToFit={true}
                                //nodeVal is used to set the size of the node, adjust to globalScale
                                nodeVal={(node) => {
                                    //get globalScale
                                    const globalScale = fgRef.current?.zoom() || 1;
                                    let adjustedGlobalScale = (globalScale * 2) / globalScale;
                                    const size = (node.size || 16) / adjustedGlobalScale * 2;
                                    return size;
                                }}
                                onNodeDragEnd={(node) => {
                                    node.fx = node.x;
                                    node.fy = node.y;
                                }}
                                //small arrow at the end of the link
                                //no arrow if the link has "same_labels" property set to true
                                linkDirectionalArrowLength={link => link.same_labels ? 0 : 6}
                                linkDirectionalArrowRelPos={1}
                                linkDirectionalArrowColor={'color'}
                                linkCanvasObjectMode={() => 'after'}
                                linkCanvasObject={(link, ctx, globalScale) => {
                                    const MAX_FONT_SIZE = 12 / globalScale;
                                    const LABEL_NODE_MARGIN = 8 / globalScale;

                                    const start = link.source;
                                    const end = link.target;

                                    if (typeof start !== 'object' || typeof end !== 'object') return;

                                    const { source, target } = link;
                                    const curvature = +link.curvature || 0.5; // default curvature
                                    const cpX = (source.x + target.x) / 2 + (target.y - source.y) * curvature;
                                    const cpY = (source.y + target.y) / 2 + (source.x - target.x) * curvature;

                                    const getPoint = t => {
                                        const x = Math.pow(1 - t, 2) * source.x + 2 * (1 - t) * t * cpX + Math.pow(t, 2) * target.x;
                                        const y = Math.pow(1 - t, 2) * source.y + 2 * (1 - t) * t * cpY + Math.pow(t, 2) * target.y;
                                        return { x, y };
                                    };

                                    // Get midpoint (t = 0.5)
                                    const textPos = getPoint(0.5);

                                    const relLink = { x: end.x - start.x, y: end.y - start.y };

                                    const maxTextLength = Math.sqrt(Math.pow(relLink.x, 2) + Math.pow(relLink.y, 2)) - LABEL_NODE_MARGIN * 2;

                                    let textAngle = Math.atan2(relLink.y, relLink.x);
                                    // maintain label vertical orientation for legibility
                                    if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
                                    if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);

                                    // const label = `${link.labels.forward}`;
                                    let label = `${link.label}`;

                                    ctx.font = '1px Sans-Serif';
                                    const fontSize = Math.min(MAX_FONT_SIZE, maxTextLength / ctx.measureText(label).width);
                                    ctx.font = `${fontSize}px Sans-Serif`;

                                    ctx.save();
                                    ctx.translate(textPos.x, textPos.y);
                                    ctx.rotate(textAngle);

                                    ctx.textAlign = 'center';
                                    ctx.textBaseline = 'middle';
                                    // ctx.fillStyle = 'white';
                                    //use line color
                                    ctx.fillStyle = link.color || 'white';
                                    ctx.fillText(label, 0, 0);
                                    ctx.restore();
                                }}
                                linkLineDash={link => link.dashed ? [4, 2] : undefined}
                            />
                        </> :
                            <Typography variant="body1" component="p">No relationships found</Typography>
                    }
                </Box>
            </Box>
        </>
    );
}

export default RouteSources;