import { getGenderLabel, getRelationshipType, reprocessRelationshipsForChart } from '../../helpers/Misc';
import { MAX_NODE_SIZE, MIN_NODE_SIZE } from './constants';
import { getCharacterImageUrl, measureLabelWidth } from './graphUtils';

const IMAGE_CACHE = new Map();

function getCachedGraphImage(imageUrl) {
  if (IMAGE_CACHE.has(imageUrl)) {
    return IMAGE_CACHE.get(imageUrl);
  }

  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.decoding = 'async';
  image.src = imageUrl;
  IMAGE_CACHE.set(imageUrl, image);

  return image;
}

export function buildRelationshipDataFromSource(sourcesData, fgRef) {
  const relData = {
    characters: [],
    relationships: [],
  };

  let relationships = [];

  if (!sourcesData.characters || sourcesData.characters.length === 0) {
    relData.graphData = { nodes: [], links: [] };
    return relData;
  }

  let refreshScheduled = false;
  const scheduleRefresh = () => {
    if (refreshScheduled) {
      return;
    }

    refreshScheduled = true;
    requestAnimationFrame(() => {
      refreshScheduled = false;
      fgRef.current?.refresh();
    });
  };

  for (const character of sourcesData.characters) {
    const imageUrl = getCharacterImageUrl(character.remote_image_id);
    const image = getCachedGraphImage(imageUrl);
    if (!image.complete) {
      image.addEventListener('load', scheduleRefresh, { once: true });
      image.addEventListener('error', scheduleRefresh, { once: true });
    }

    const genderLabel = getGenderLabel(character.gender);

    relData.characters.push({
      id: character.id,
      gender: character.gender,
      name: character.name,
      age: character.age,
      displayLabel: `${genderLabel.symbol}${character.name}${character.age ? ` (${character.age})` : ''}`,
      image_url: imageUrl,
      image,
    });

    if (character.relationships && character.relationships.length > 0) {
      character.relationships.forEach((relationship) => {
        const relationshipType = relationship.relationship_type
          ? getRelationshipType(relationship.relationship_type)
          : getRelationshipType(relationship.reciprocal_relationship_type);

        relationships.push({
          from: relationship.from_id,
          to: relationship.to_id,
          labels: {
            forward: relationship.relationship_type,
            reverse: relationship.reciprocal_relationship_type,
          },
          color: relationshipType.color,
          type: relationshipType.type,
          same_labels: relationship.relationship_type === relationship.reciprocal_relationship_type,
          visualize: relationship.visualize,
        });
      });
    }
  }

  relationships = reprocessRelationshipsForChart(relationships).map((relationship) => ({
    ...relationship,
    label_width: measureLabelWidth(relationship.label),
  }));

  const relationshipCounts = {};
  relationships.forEach((relationship) => {
    if (relationship.visualize === false) return;

    const source = relationship.source;
    const target = relationship.target;

    if (!relationshipCounts[source]) {
      relationshipCounts[source] = 0;
    }
    if (!relationshipCounts[target]) {
      relationshipCounts[target] = 0;
    }

    relationshipCounts[source]++;
    relationshipCounts[target]++;
  });

  const maxRelationshipCount = Math.max(...Object.values(relationshipCounts), 1);

  relData.characters.forEach((character) => {
    const relationshipCount = relationshipCounts[character.id] || 0;
    character.relationship_count = relationshipCount;
    character.size = Math.max(
      MIN_NODE_SIZE,
      Math.min(
        MAX_NODE_SIZE,
        (MAX_NODE_SIZE - MIN_NODE_SIZE) * (relationshipCount / maxRelationshipCount) + MIN_NODE_SIZE,
      ),
    );
  });

  relData.relationships = relationships;

  const relationshipCurvature = {};
  relData.relationships.forEach((relationship) => {
    if (relationship.visualize === false) return;

    const key = `${relationship.source}-${relationship.target}`;
    if (!relationshipCurvature[key]) {
      relationshipCurvature[key] = 0;
    }

    relationshipCurvature[key] += 0.1;
    relationship.curvature = relationshipCurvature[key];
  });

  relData.maxRelationshipCount = maxRelationshipCount;
  relData.graphData = {
    nodes: relData.characters.filter((node) => node.relationship_count > 0),
    links: relData.relationships.filter((link) => link.visualize !== false),
  };

  return relData;
}
