const loveRelated = [
  'boyfriend',
  'girlfriend',
  'husband',
  'wife',
  'affair',
  'fiance',
  'fiancee',
  'fiancée',
  'lover',
  'partner',
  'spouse',
  'significant other',
  'sweetheart',
  'darling',
  'beloved',
  'soulmate',
  'mate',
];

const potentialLoveRelated = [
  'harem candidate',
  'fiancé candidate',
  'fiancée candidate',
  'haremcandidate',
  'potential lover',
  'potential crush',
  'suitor',
  'love interest',
  'loveinterest',
  'crush',
];

const familyRelated = [
  'relative',
  'mother',
  'father',
  'brother',
  'sister',
  'uncle',
  'aunt',
  'grandmother',
  'grandfather',
  'granddaughter',
  'grandson',
  'cousin',
  'daughter',
  'son',
  'relative',
  'counterpart',
  'creator',
  'creation',
  'ward',
  'guardian',
  'ancestor',
  'descendant',
];

const occupationalRelated = ['master', 'maid', 'servant', 'mistress', 'butler', 'teacher', 'student'];
const propertyRelated = ['rapist', 'victim', 'slave', 'owner', 'pet', 'bully', 'lust'];
const other = ['friend', 'enemy', 'rival', 'acquaintance', 'colleague', 'classmate', 'partner'];

const LOVE_RELATED_SET = new Set(loveRelated);
const POTENTIAL_LOVE_RELATED_SET = new Set(potentialLoveRelated);
const FAMILY_RELATED_SET = new Set(familyRelated);
const OCCUPATIONAL_RELATED_SET = new Set(occupationalRelated);
const PROPERTY_RELATED_SET = new Set(propertyRelated);
const OTHER_RELATED_SET = new Set(other);

const PREFIXES = ['step', 'foster', 'half', 'adoptive', 'in-law', 'in law', 'acting', 'god'];
const EX_PREFIXES = ['ex-', 'ex ', 'former '];

const RELATIONSHIP_ORDER = [
  ['mother', 'father', 'step-mother', 'step-father', 'ancestor', 'descendant', 'guardian', 'creator', 'creation'],
  ['uncle', 'aunt'],
  ['brother', 'sister', 'twin brother', 'twin sister', 'step-brother', 'step-sister'],
  ['husband', 'wife'],
  ['boyfriend', 'girlfriend'],
  ['{any}-cousin'],
];

function findRelationshipOrder(relationship) {
  return RELATIONSHIP_ORDER.findIndex((group) => {
    return group.some((orderedRelationship) => {
      if (orderedRelationship === relationship) {
        return true;
      }

      if (orderedRelationship.includes('{any}')) {
        const wildcardPattern = new RegExp(`^${orderedRelationship.replace('{any}', '.*')}$`, 'i');
        return wildcardPattern.test(relationship);
      }

      return false;
    });
  });
}

function normalizeRelationshipLabel(label) {
  let relationship = label.toLowerCase().trim();
  let isStep = false;
  let isTwin = false;

  if (relationship.startsWith('twin ') || relationship.startsWith('twin-')) {
    relationship = relationship.replace(/^twin[- ]/i, '');
    isTwin = true;
  }

  for (const prefix of PREFIXES) {
    const startsWithPrefix = relationship.startsWith(`${prefix} `) || relationship.startsWith(`${prefix}-`);
    const endsWithPrefix = relationship.endsWith(` ${prefix}`) || relationship.endsWith(`-${prefix}`);

    if (startsWithPrefix || endsWithPrefix) {
      relationship = relationship.replace(new RegExp(`^(${prefix}-|${prefix} )`, 'i'), '');
      isStep = true;
    }
  }

  return { relationship, isStep, isTwin };
}

function isExRelationship(relationship) {
  return EX_PREFIXES.some((prefix) => relationship.startsWith(prefix)) || relationship === 'divored' || relationship === 'divorced';
}

function matchesRemappableRelationship(rel, remappable) {
  const isForwardMatch = rel.labels.forward === remappable.a && rel.labels.reverse === remappable.b;
  const isReverseMatch = rel.labels.forward === remappable.b && rel.labels.reverse === remappable.a;
  return isForwardMatch || isReverseMatch;
}

function createEdgeRelationship(rel, source, target, label) {
  return {
    source,
    target,
    label,
    color: rel.color,
    type: rel.type,
    curvature: rel.curvature,
    same_labels: rel.same_labels,
    distance: rel.distance,
    visualize: rel.visualize === 1,
  };
}

export function sortRelationships(relationships) {
  if (!Array.isArray(relationships) || relationships.length === 0) {
    return relationships;
  }

  const sortedRelationships = [];
  const unsortedRelationships = [];

  for (const relationship of relationships) {
    const order = findRelationshipOrder(relationship);

    if (order === -1) {
      unsortedRelationships.push(relationship);
      continue;
    }

    sortedRelationships.push({ relationship, order });
  }

  sortedRelationships.sort((a, b) => {
    if (a.order === b.order) {
      return a.relationship.localeCompare(b.relationship);
    }
    return a.order - b.order;
  });

  return [...sortedRelationships.map((item) => item.relationship), ...unsortedRelationships];
}

export function getRelationshipType(relationshipLabel) {
  if (!relationshipLabel) {
    return {
      color: '#FFFFFF',
      type: 'unknown',
    };
  }

  let color = '#FFFFFF';
  let type = 'unknown';

  const { relationship, isStep, isTwin } = normalizeRelationshipLabel(relationshipLabel);

  if (LOVE_RELATED_SET.has(relationship)) {
    color = '#FF69B4';
    type = 'love';
  } else if (POTENTIAL_LOVE_RELATED_SET.has(relationship)) {
    color = '#FFB6C1';
    type = 'potential love';
  } else if (FAMILY_RELATED_SET.has(relationship)) {
    color = '#ADD8E6';
    type = 'family';
  } else if (OCCUPATIONAL_RELATED_SET.has(relationship)) {
    color = '#FFD580';
    type = 'occupational';
  } else if (PROPERTY_RELATED_SET.has(relationship)) {
    color = '#8B0000';
    type = 'property';
  } else if (OTHER_RELATED_SET.has(relationship)) {
    color = '#D3D3D3';
    type = 'other';
  }

  if (isExRelationship(relationship)) {
    color = '#A9A9A9';
    type = 'ex-relationship';
  }

  if (isStep) {
    color += 'aa';
  }

  if (isTwin) {
    type = 'twin ' + type;
  }

  return {
    color,
    type,
  };
}

const remappableRelationships = [
  { a: 'brother', b: 'sister', label: 'sibling' },
  { a: 'brother-in-law', b: 'sister-in-law', label: 'sibling-in-law' },
  { a: 'half-brother', b: 'half-sister', label: 'half-sibling' },
  { a: 'step-brother', b: 'step-sister', label: 'step-sibling' },
  { a: 'twin brother', b: 'twin sister', label: 'twin sibling' },
  { a: 'adoptive brother', b: 'adoptive sister', label: 'adoptive sibling' },
  { a: 'husband', b: 'wife', label: 'married' },
  { a: 'acting husband', b: 'acting wife', label: 'acting married' },
  { a: 'boyfriend', b: 'girlfriend', label: 'partner' },
  { a: 'ex-boyfriend', b: 'ex-girlfriend', label: 'ex-partner' },
  { a: 'ex-husband', b: 'ex-wife', label: 'divorced' },
  { a: 'fiancé', b: 'fiancée', label: 'engaged' },
];

const dashableRelationships = [
  'step-{relationship}',
  'step {relationship}',
  'foster-{relationship}',
  'foster {relationship}',
  'half-{relationship}',
  'half {relationship}',
  'adoptive-{relationship}',
  'adoptive {relationship}',
  'ex-{relationship}',
  'ex {relationship}',
  'former-{relationship}',
  'former {relationship}',
  'crush',
  'relative',
  'love interest',
  'harem candidate',
  'divorced',
  'descendant',
  'ancestor',
];

const removableOpposites = [
  'maid',
  'servant',
  'slave',
  'pet',
  'butler',
  '{any}father',
  '{any}mother',
  'creator',
  'guardian',
  'clone',
  'lady-in-waiting',
  'rapist',
  'bully',
  'fiancé candidate',
];

const DASHABLE_FRAGMENTS = new Set(dashableRelationships.map((relationship) => relationship.replace('{relationship}', '').toLowerCase()));
const REMOVABLE_OPPOSITE_FRAGMENTS = new Set(removableOpposites.map((relationship) => relationship.replace('{any}', '').toLowerCase()));

export function reprocessRelationshipsForChart(relationships) {
  let processed = [...relationships];

  remappableRelationships.forEach((relationship) => {
    processed.forEach((rel) => {
      if (matchesRemappableRelationship(rel, relationship)) {
        rel.labels.forward = relationship.label;
        rel.labels.reverse = relationship.label;
        rel.same_labels = true;
      }
    });
  });

  processed = processed.filter((relationship, index, self) =>
    index === self.findIndex((r) => {
      return (
        (r.from === relationship.from && r.to === relationship.to && r.labels.forward === relationship.labels.forward && r.labels.reverse === relationship.labels.reverse) ||
        (r.from === relationship.to && r.to === relationship.from && r.labels.forward === relationship.labels.reverse && r.labels.reverse === relationship.labels.forward)
      );
    }),
  );

  processed = processed.map((relationship) => {
    REMOVABLE_OPPOSITE_FRAGMENTS.forEach((removable) => {
      if (relationship.labels.forward?.toLowerCase().includes(removable)) {
        relationship.labels.reverse = '';
      }
      if (relationship.labels.reverse?.toLowerCase().includes(removable)) {
        relationship.labels.forward = '';
      }
    });
    return relationship;
  });

  processed = processed.flatMap((rel) => [
    createEdgeRelationship(rel, rel.from, rel.to, rel.labels.forward),
    ...(rel.same_labels
      ? []
      : [
          createEdgeRelationship(rel, rel.to, rel.from, rel.labels.reverse),
        ]),
  ]);

  processed = processed.filter((relationship) => relationship.label && relationship.label.trim() !== '');

  processed = processed.map((relationship) => {
    const labelLower = relationship.label.toLowerCase();
    const isDashed = [...DASHABLE_FRAGMENTS].some((dashable) => labelLower.includes(dashable));

    return { ...relationship, dashed: isDashed };
  });

  return processed;
}
