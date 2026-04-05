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
  'twin brother',
  'twin sister',
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

const propertyRelated = ['rapist', 'victim', 'master', 'slave', 'owner', 'pet', 'maid', 'servant', 'mistress', 'butler', 'bully', 'lust'];
const other = ['friend', 'enemy', 'rival', 'acquaintance', 'colleague', 'classmate', 'partner'];

export function sortRelationships(relationships) {
  if (!Array.isArray(relationships) || relationships.length === 0) {
    return relationships;
  }

  const relationshipOrder = {
    1: ['mother', 'father', 'step-mother', 'step-father', 'ancestor', 'descendant', 'guardian', 'creator', 'creation'],
    2: ['uncle', 'aunt'],
    3: ['brother', 'sister', 'step-brother', 'step-sister'],
    4: ['husband', 'wife'],
    5: ['boyfriend', 'girlfriend'],
    6: ['{any}-cousin'],
  };

  const sortedRelationships = [];
  const unsortedRelationships = [];

  const relationshipKeys = Object.keys(relationshipOrder);
  for (const relationship of relationships) {
    let found = false;
    for (const key of relationshipKeys) {
      if (relationshipOrder[key].includes(relationship)) {
        sortedRelationships.push({ relationship, order: key });
        found = true;
        break;
      }
    }
    if (!found) {
      unsortedRelationships.push(relationship);
    }
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
  if (!relationshipLabel) return '#FFFFFF';

  let color = '#FFFFFF';
  let type = 'unknown';

  let relationship = relationshipLabel.toLowerCase().trim();
  let is_step = false;
  const prefixes = ['step', 'foster', 'half', 'adoptive', 'in-law', 'in law', 'acting', 'god'];

  for (const prefix of prefixes) {
    if (relationship.startsWith(prefix + '') || relationship.endsWith(prefix)) {
      relationship = relationship.replace(new RegExp(`^(${prefix}-|${prefix} )`, 'i'), '');
      is_step = true;
    }
  }

  if (loveRelated.includes(relationship)) {
    color = '#FF69B4';
    type = 'love';
  } else if (potentialLoveRelated.includes(relationship)) {
    color = '#FFB6C1';
    type = 'potential love';
  } else if (familyRelated.includes(relationship)) {
    color = '#ADD8E6';
    type = 'family';
  } else if (propertyRelated.includes(relationship)) {
    color = '#8B0000';
    type = 'property';
  } else if (other.includes(relationship)) {
    color = '#D3D3D3';
    type = 'other';
  }

  if (relationship.startsWith('ex-') || relationship.startsWith('ex ') || relationship.startsWith('former ') || relationship === 'divored') {
    color = '#A9A9A9';
    type = 'ex-relationship';
  }

  if (is_step) {
    color += 'aa';
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

export function reprocessRelationshipsForChart(relationships) {
  let processed = [...relationships];

  remappableRelationships.forEach((relationship) => {
    processed.forEach((rel) => {
      if ((rel.labels.forward === relationship.a && rel.labels.reverse === relationship.b) || (rel.labels.forward === relationship.b && rel.labels.reverse === relationship.a)) {
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
    removableOpposites.forEach((removable) => {
      if (relationship.labels.forward?.toLowerCase().includes(removable.replace('{any}', '').toLowerCase())) {
        relationship.labels.reverse = '';
      }
      if (relationship.labels.reverse?.toLowerCase().includes(removable.replace('{any}', '').toLowerCase())) {
        relationship.labels.forward = '';
      }
    });
    return relationship;
  });

  processed = processed.flatMap((rel) => [
    {
      source: rel.from,
      target: rel.to,
      label: rel.labels.forward,
      color: rel.color,
      type: rel.type,
      curvature: rel.curvature,
      same_labels: rel.same_labels,
      distance: rel.distance,
      visualize: rel.visualize === 1 ? true : false,
    },
    ...(rel.same_labels
      ? []
      : [
          {
            source: rel.to,
            target: rel.from,
            label: rel.labels.reverse,
            color: rel.color,
            type: rel.type,
            curvature: rel.curvature,
            same_labels: rel.same_labels,
            distance: rel.distance,
            visualize: rel.visualize === 1 ? true : false,
          },
        ]),
  ]);

  processed = processed.filter((relationship) => relationship.label && relationship.label.trim() !== '');

  processed = processed.map((relationship) => {
    let isDashed = false;
    dashableRelationships.forEach((dashable) => {
      if (relationship.label.toLowerCase().includes(dashable.replace('{relationship}', '').toLowerCase())) {
        isDashed = true;
      }
    });
    return { ...relationship, dashed: isDashed };
  });

  return processed;
}
