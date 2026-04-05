import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import ForceGraph2D from 'react-force-graph-2d';
import { useResizeDetector } from 'react-resize-detector';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { getAPIUrl } from '../../helpers/API';
import { getGenderLabel, getRelationshipType, TabPanel, tabProps } from '../../helpers/Misc';
import ImageGallery from '../../components/ImageGallery';
import {
  DASHED_LINK_PATTERN,
  LINK_LABEL_ZOOM_THRESHOLD,
  MIN_LINK_FONT_SIZE,
  MIN_NODE_SIZE,
  NODE_LABEL_ZOOM_THRESHOLD,
  SOURCE_TABS,
} from './constants';
import { buildRelationshipDataFromSource } from './buildRelationshipData';
import { getImageCrop } from './graphUtils';

const ABUSE_LABELS = ['rapist', 'victim', 'bully', 'slave', 'master', 'pet', 'owner'];
const MINOR_AGE = 18;
const MINOR_ADULT_GAP_THRESHOLD = 3;
const MINOR_MINOR_SCORE = 8;
const FAMILY_KEYWORDS = [
  'mother',
  'father',
  'sister',
  'brother',
  'daughter',
  'son',
  'cousin',
  'aunt',
  'uncle',
  'grandmother',
  'grandfather',
  'granddaughter',
  'grandson',
  'sibling',
  'relative',
  'ancestor',
  'descendant',
  'guardian',
  'ward',
  'twin',
];
const ROMANTIC_KEYWORDS = [
  'boyfriend',
  'girlfriend',
  'husband',
  'wife',
  'fiance',
  'fiancee',
  'fiancee candidate',
  'lover',
  'partner',
  'spouse',
  'crush',
  'love interest',
  'harem candidate',
  'sweetheart',
  'beloved',
  'soulmate',
  'mate',
];

function normalizeRelationshipLabel(label) {
  return String(label || '')
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasAnyKeyword(labels, keywords) {
  return labels.some((label) => keywords.some((keyword) => label.includes(keyword)));
}

function computeMoralRisk(labelPairs, ageGap, ageA, ageB) {
  const allTypes = new Set();
  const allLabels = [];
  for (const { labelForward, labelReverse } of labelPairs) {
    [labelForward, labelReverse].filter(Boolean).forEach((l) => {
      const normalized = normalizeRelationshipLabel(l);
      allLabels.push(normalized);
      const t = getRelationshipType(normalized).type;
      if (t && t !== 'unknown') allTypes.add(t);
    });
  }

  const hasRomantic =
    allTypes.has('love') ||
    allTypes.has('potential love') ||
    hasAnyKeyword(allLabels, ROMANTIC_KEYWORDS);
  const hasFamily = allTypes.has('family') || hasAnyKeyword(allLabels, FAMILY_KEYWORDS);
  const isAbuse = allLabels.some((l) => ABUSE_LABELS.some((a) => l.includes(a)));

  const reasons = [];

  if (isAbuse) {
    reasons.push({ label: 'Abuse / coercion', score: 25 });
  } else if (allTypes.has('property') && !hasRomantic) {
    reasons.push({ label: 'Power imbalance', score: 10 });
  }

  if (hasRomantic) {
    if (hasFamily) {
      reasons.push({ label: 'Incest', score: allTypes.has('love') ? 40 : 25 });
    }

    const aMinor = ageA != null && ageA < MINOR_AGE;
    const bMinor = ageB != null && ageB < MINOR_AGE;
    if (aMinor && bMinor) {
      reasons.push({ label: 'Both minors', score: MINOR_MINOR_SCORE });
    } else if (aMinor || bMinor) {
      if (ageGap != null && ageGap > MINOR_ADULT_GAP_THRESHOLD) {
        reasons.push({
          label: `Adult–minor relationship (gap>${MINOR_ADULT_GAP_THRESHOLD})`,
          score: 30,
        });
      }
    }

    if (ageGap != null && ageGap > 0) {
      const gapScore = Math.min(ageGap, 15);
      reasons.push({ label: `Age gap (${ageGap})`, score: gapScore });
    }
  }

  const total = Math.round(reasons.reduce((sum, r) => sum + r.score, 0) * 10) / 10;
  return {
    total,
    reasons,
    debug: {
      hasFamily,
      hasRomantic,
      isAbuse,
      labels: [...new Set(allLabels)],
    },
  };
}

function buildRelationshipPairs(characters) {
  const pairMap = {};
  const charMap = {};
  characters.forEach((c) => { charMap[c.id] = c; });

  characters.forEach((character) => {
    if (!character.relationships) return;
    character.relationships.forEach((rel) => {
      const minId = Math.min(rel.from_id, rel.to_id);
      const maxId = Math.max(rel.from_id, rel.to_id);
      const fwdLabel = rel.from_id === minId ? (rel.relationship_type ?? '') : (rel.reciprocal_relationship_type ?? '');
      const revLabel = rel.from_id === minId ? (rel.reciprocal_relationship_type ?? '') : (rel.relationship_type ?? '');

      const pairKey = `${minId}-${maxId}`;
      if (!pairMap[pairKey]) {
        const charA = charMap[minId];
        const charB = charMap[maxId];
        if (!charA || !charB) return;
        pairMap[pairKey] = { charA, charB, labels: [], seenLabels: new Set() };
      }

      const labelKey = `${fwdLabel}|${revLabel}`;
      if (pairMap[pairKey].seenLabels.has(labelKey)) return;
      pairMap[pairKey].seenLabels.add(labelKey);
      pairMap[pairKey].labels.push({ labelForward: fwdLabel, labelReverse: revLabel });
    });
  });

  return Object.values(pairMap).map(({ charA, charB, labels }) => {
    const ageGap = charA.age != null && charB.age != null ? Math.abs(charA.age - charB.age) : null;
    const moralRisk = computeMoralRisk(labels, ageGap, charA.age, charB.age);
    return { charA, charB, labels, ageGap, moralRisk };
  });
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
  const [relViewMode, setRelViewMode] = useState('graph');
  const [relSortField, setRelSortField] = useState('moral_risk');
  const [relSortDir, setRelSortDir] = useState('desc');
  const [showRiskDebug, setShowRiskDebug] = useState(false);

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

      sourcesData.characters.sort((a, b) => (b.relationships?.length || 0) - (a.relationships?.length || 0));

      setData(sourcesData);
      setRelationshipData(buildRelationshipDataFromSource(sourcesData, fgRef));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tab === undefined) {
      navigate(`/sources/${id}/${SOURCE_TABS[0].url_key}`, { replace: true });
      return;
    }

    const newActiveTab = Number(Object.keys(SOURCE_TABS).find((key) => SOURCE_TABS[key].url_key === tab));
    if (newActiveTab !== undefined) {
      setActiveTab(newActiveTab);
    } else {
      setActiveTab(0);
    }
  }, [id, navigate, tab]);

  const changeTab = (newValue) => {
    const newTab = SOURCE_TABS[newValue].url_key;
    navigate(`/sources/${id}/${newTab}`);
  };

  useEffect(() => {
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

  const handleRelSort = (field) => {
    if (relSortField === field) {
      setRelSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setRelSortField(field);
      setRelSortDir('asc');
    }
  };

  const sortedRelPairs = data
    ? [...buildRelationshipPairs(data.characters)].sort((a, b) => {
        let cmp = 0;
        if (relSortField === 'moral_risk') {
          cmp = a.moralRisk.total - b.moralRisk.total;
        } else if (relSortField === 'age_gap') {
          if (a.ageGap == null && b.ageGap == null) cmp = 0;
          else if (a.ageGap == null) cmp = 1;
          else if (b.ageGap == null) cmp = -1;
          else cmp = a.ageGap - b.ageGap;
        }
        return relSortDir === 'asc' ? cmp : -cmp;
      })
    : [];

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
          {Object.keys(SOURCE_TABS).map((key) => (
            <Tab
              key={key}
              label={SOURCE_TABS[key].label}
              {...tabProps(key)}
            />
          ))}
        </Tabs>
      </Box>
      <TabPanel value={activeTab} index={0}>
        <Box>
          <Typography variant="h6" component="h2" gutterBottom>Characters ({data.characters.length})</Typography>
          <Grid container spacing={2}>
            {data.characters.map((character) => (
              <Grid item size={{ md: 12 / 8 }} key={character.id}>
                <Card elevation={2}>
                  <CardActionArea
                    component={Link}
                    to={`/characters/${character.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <CardMedia
                      component="img"
                      image={character.remote_image_id ? `https://cdn.kirino.sh/i/${character.remote_image_id}.png` : 'https://placehold.co/400'}
                      alt={character.name}
                      sx={{ objectFit: 'cover', objectPosition: 'top', backgroundColor: '#f0f0f0' }}
                      style={{ width: '100%', height: 'auto', aspectRatio: '1 / 1.25' }}
                    />
                    <CardContent
                      sx={{
                        padding: '4px',
                      }}
                    >
                      <Typography variant="body1" component="div" gutterBottom>
                        {getGenderLabel(character.gender).symbol} {character.name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <ImageGallery image_data={data.images} />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <Box ref={containerRef} sx={{ maxWidth: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Relationships ({relationshipData?.relationships?.length || 0})
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ToggleButtonGroup
                value={relViewMode}
                exclusive
                onChange={(_, v) => { if (v !== null) setRelViewMode(v); }}
                size="small"
              >
                <ToggleButton value="graph">Graph</ToggleButton>
                <ToggleButton value="list">List</ToggleButton>
              </ToggleButtonGroup>
              <ToggleButton
                size="small"
                value="risk-debug"
                selected={showRiskDebug}
                onChange={() => setShowRiskDebug((prev) => !prev)}
              >
                Debug
              </ToggleButton>
            </Box>
          </Box>
          {relViewMode === 'graph' ? (
            width ? (
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
                linkDirectionalArrowLength={(link) => (link.same_labels ? 0 : 4)}
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
                linkLineDash={(link) => (link.dashed ? DASHED_LINK_PATTERN : undefined)}
              />
            ) : (
              <Typography variant="body1" component="p">No relationships found</Typography>
            )
          ) : (
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Character A</TableCell>
                    <TableCell>Relationship</TableCell>
                    <TableCell>Character B</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={relSortField === 'moral_risk'}
                        direction={relSortField === 'moral_risk' ? relSortDir : 'desc'}
                        onClick={() => handleRelSort('moral_risk')}
                      >
                        Moral Risk
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={relSortField === 'age_gap'}
                        direction={relSortField === 'age_gap' ? relSortDir : 'asc'}
                        onClick={() => handleRelSort('age_gap')}
                      >
                        Age Gap
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedRelPairs.map((pair, idx) => {
                    return (
                      <TableRow key={idx} hover>
                        <TableCell>
                          <Link to={`/characters/${pair.charA.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {pair.charA.name}{pair.charA.age != null ? ` (${pair.charA.age})` : ''}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {pair.labels.map(({ labelForward, labelReverse }, i) => {
                              const relType = getRelationshipType(labelForward || labelReverse);
                              const relLabel = !labelForward
                                ? labelReverse
                                : !labelReverse || labelForward === labelReverse
                                ? labelForward
                                : `${labelForward} / ${labelReverse}`;
                              return (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: relType.color, flexShrink: 0 }} />
                                  {relLabel}
                                </Box>
                              );
                            })}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Link to={`/characters/${pair.charB.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {pair.charB.name}{pair.charB.age != null ? ` (${pair.charB.age})` : ''}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {pair.moralRisk.total > 0 ? (
                            <Box>
                              <Typography variant="body2" fontWeight="bold">{pair.moralRisk.total}</Typography>
                              {pair.moralRisk.reasons.map((r, i) => (
                                <Typography key={i} variant="caption" display="block" color="text.secondary">
                                  {r.label} (+{r.score})
                                </Typography>
                              ))}
                              {showRiskDebug && (
                                <>
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    family={String(pair.moralRisk.debug.hasFamily)}, romantic={String(pair.moralRisk.debug.hasRomantic)}, abuse={String(pair.moralRisk.debug.isAbuse)}
                                  </Typography>
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    labels: {pair.moralRisk.debug.labels.join(', ') || 'none'}
                                  </Typography>
                                </>
                              )}
                            </Box>
                          ) : '—'}
                        </TableCell>
                        <TableCell>{pair.ageGap != null ? pair.ageGap : '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </TabPanel>
    </>
  );
}

export default RouteSourcesObject;
