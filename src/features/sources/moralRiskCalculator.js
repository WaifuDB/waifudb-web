import { getRelationshipType } from '../../helpers/Misc';

const ABUSE_LABELS = ['rapist', 'victim', 'bully', 'slave', 'pet', 'owner'];
const MINOR_AGE = 18;
const MINOR_ADULT_GAP_THRESHOLD = 3;
const MINOR_MINOR_SCORE = 8;
const OCCUPATIONAL_ROMANCE_SCORE = 3;
const EDUCATIONAL_ROMANCE_SCORE = 12;
const EX_PARTNER_WITH_CHILD_SCORE = 8;
const CRUSH_ONLY_INCEST_MULTIPLIER = 0.45;
const ONE_SIDED_CRUSH_ONLY_INCEST_MULTIPLIER = 0.2;
const SHARED_CHILD_MULTIPLIER_STEP = 0.2;
const SHARED_CHILD_AMBIGUOUS_STEP = 0.05;
const SHARED_CHILD_MULTIPLIER_MAX_BONUS = 0.8;
const STEP_INCEST_SCORE = 18;
const NON_BLOOD_FAMILY_INCEST_SCORE = 12;
const BLOOD_INCEST_SCORE = 40;
const EXTENDED_BLOOD_INCEST_SCORE = 30;
const TWIN_INCEST_SCORE = 55;
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
const CRUSH_KEYWORDS = ['crush', 'potential crush'];
const PARENT_ROLE_KEYWORDS = ['mother', 'father', 'parent', 'dad', 'mom'];
const CHILD_ROLE_KEYWORDS = ['daughter', 'son', 'child'];
const OCCUPATIONAL_SERVICE_KEYWORDS = ['maid', 'servant', 'butler'];
const OCCUPATIONAL_AUTHORITY_KEYWORDS = ['master'];
const EDUCATIONAL_AUTHORITY_KEYWORDS = ['teacher', 'sensei', 'professor', 'instructor', 'tutor'];
const EDUCATIONAL_DEPENDENT_KEYWORDS = ['student', 'pupil', 'trainee', 'apprentice'];
const STEP_FAMILY_KEYWORDS = ['step mother', 'step father', 'step sister', 'step brother', 'step sibling', 'step son', 'step daughter', 'step aunt', 'step uncle', 'step cousin'];
const NON_BLOOD_FAMILY_KEYWORDS = ['adoptive', 'foster', 'guardian', 'ward', 'god '];
const DIRECT_BLOOD_FAMILY_KEYWORDS = ['mother', 'father', 'sister', 'brother', 'daughter', 'son', 'grandmother', 'grandfather', 'granddaughter', 'grandson', 'ancestor', 'descendant'];
const EXTENDED_BLOOD_FAMILY_KEYWORDS = ['aunt', 'uncle', 'cousin'];
const TWIN_FAMILY_KEYWORDS = ['twin'];

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

function getCrushDynamic(labelPairs) {
  const romanticLabels = [];
  let hasLoveLabel = false;
  let hasAnyCrushLabel = false;
  let hasMutualCrush = false;
  let hasOneSidedCrush = false;

  labelPairs.forEach(({ labelForward, labelReverse }) => {
    const forward = normalizeRelationshipLabel(labelForward);
    const reverse = normalizeRelationshipLabel(labelReverse);
    const forwardType = forward ? getRelationshipType(forward).type : 'unknown';
    const reverseType = reverse ? getRelationshipType(reverse).type : 'unknown';
    const forwardCrush = hasAnyKeyword([forward], CRUSH_KEYWORDS);
    const reverseCrush = hasAnyKeyword([reverse], CRUSH_KEYWORDS);

    if (forwardType === 'love' || reverseType === 'love') {
      hasLoveLabel = true;
    }

    if (forwardType === 'love' || forwardType === 'potential love') {
      romanticLabels.push(forward);
    }
    if (reverseType === 'love' || reverseType === 'potential love') {
      romanticLabels.push(reverse);
    }

    if (forwardCrush || reverseCrush) {
      hasAnyCrushLabel = true;
    }

    if (forwardCrush && reverseCrush) {
      hasMutualCrush = true;
    }

    if ((forwardCrush && !reverseCrush) || (reverseCrush && !forwardCrush)) {
      hasOneSidedCrush = true;
    }
  });

  const romanticLabelsFiltered = romanticLabels.filter(Boolean);
  const crushOnly =
    !hasLoveLabel &&
    romanticLabelsFiltered.length > 0 &&
    romanticLabelsFiltered.every((label) => hasAnyKeyword([label], CRUSH_KEYWORDS));

  return {
    crushOnly,
    oneSidedCrushOnly: crushOnly && hasOneSidedCrush && !hasMutualCrush,
  };
}

function getIncestSeverity(labels) {
  if (hasAnyKeyword(labels, TWIN_FAMILY_KEYWORDS)) {
    return { label: 'Twin incest', score: TWIN_INCEST_SCORE, kind: 'twin' };
  }

  if (hasAnyKeyword(labels, STEP_FAMILY_KEYWORDS)) {
    return { label: 'Step-family incest', score: STEP_INCEST_SCORE, kind: 'step' };
  }

  if (hasAnyKeyword(labels, NON_BLOOD_FAMILY_KEYWORDS)) {
    return { label: 'Non-blood family incest', score: NON_BLOOD_FAMILY_INCEST_SCORE, kind: 'non-blood' };
  }

  if (hasAnyKeyword(labels, DIRECT_BLOOD_FAMILY_KEYWORDS)) {
    return { label: 'Blood-related incest', score: BLOOD_INCEST_SCORE, kind: 'blood' };
  }

  if (hasAnyKeyword(labels, EXTENDED_BLOOD_FAMILY_KEYWORDS)) {
    return { label: 'Extended blood-family incest', score: EXTENDED_BLOOD_INCEST_SCORE, kind: 'extended-blood' };
  }

  return { label: 'Incest', score: BLOOD_INCEST_SCORE, kind: 'generic' };
}

function addDirectedParentChild(parentChildrenMap, childParentsMap, parentId, childId) {
  if (!parentChildrenMap[parentId]) {
    parentChildrenMap[parentId] = new Set();
  }
  parentChildrenMap[parentId].add(childId);

  if (!childParentsMap[childId]) {
    childParentsMap[childId] = new Set();
  }
  childParentsMap[childId].add(parentId);
}

function ingestParentChildFromLabel(parentChildrenMap, childParentsMap, sourceId, targetId, rawLabel) {
  const label = normalizeRelationshipLabel(rawLabel);
  if (!label) return;

  if (PARENT_ROLE_KEYWORDS.some((keyword) => label.includes(keyword))) {
    addDirectedParentChild(parentChildrenMap, childParentsMap, sourceId, targetId);
  }

  if (CHILD_ROLE_KEYWORDS.some((keyword) => label.includes(keyword))) {
    addDirectedParentChild(parentChildrenMap, childParentsMap, targetId, sourceId);
  }
}

function getSharedChildrenDetails(parentChildrenMap, childParentsMap, aId, bId) {
  const aChildren = parentChildrenMap[aId] || new Set();
  const bChildren = parentChildrenMap[bId] || new Set();
  if (aChildren.size === 0 || bChildren.size === 0) {
    return {
      sharedChildIds: [],
      ambiguousSharedChildIds: [],
    };
  }

  const sharedChildIds = [];
  const ambiguousSharedChildIds = [];
  aChildren.forEach((childId) => {
    if (!bChildren.has(childId)) return;
    sharedChildIds.push(childId);

    const parents = childParentsMap[childId] || new Set();
    if (parents.size > 2) {
      ambiguousSharedChildIds.push(childId);
    }
  });

  return {
    sharedChildIds,
    ambiguousSharedChildIds,
  };
}

function isMale(character) {
  return character?.gender === 'male';
}

function isFemale(character) {
  return character?.gender === 'female';
}

function shouldSwapToMaleFirst(charA, charB) {
  return isFemale(charA) && isMale(charB);
}

function reverseLabelDirection(labels) {
  return labels.map(({ labelForward, labelReverse }) => ({
    labelForward: labelReverse,
    labelReverse: labelForward,
  }));
}

function computeMoralRisk(
  labelPairs,
  ageGap,
  ageA,
  ageB,
  sharedChildren = [],
  ambiguousSharedChildren = [],
) {
  const sharedChildrenCount = sharedChildren.length;
  const ambiguousSharedChildrenCount = ambiguousSharedChildren.length;
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
  const hasExPartner = allTypes.has('ex-relationship');
  const hasFamily = allTypes.has('family') || hasAnyKeyword(allLabels, FAMILY_KEYWORDS);
  const isAbuse = allLabels.some((l) => ABUSE_LABELS.some((a) => l.includes(a)));
  const hasOccupationalServiceRole = hasAnyKeyword(allLabels, OCCUPATIONAL_SERVICE_KEYWORDS);
  const hasOccupationalAuthorityRole = hasAnyKeyword(allLabels, OCCUPATIONAL_AUTHORITY_KEYWORDS);
  const hasOccupational = hasOccupationalServiceRole && hasOccupationalAuthorityRole;
  const hasEducationalAuthorityRole = hasAnyKeyword(allLabels, EDUCATIONAL_AUTHORITY_KEYWORDS);
  const hasEducationalDependentRole = hasAnyKeyword(allLabels, EDUCATIONAL_DEPENDENT_KEYWORDS);
  const hasEducationalDynamic = hasEducationalAuthorityRole && hasEducationalDependentRole;
  const incestSeverity = hasFamily ? getIncestSeverity(allLabels) : null;
  const crushDynamic = getCrushDynamic(labelPairs);

  const reasons = [];

  if (isAbuse) {
    reasons.push({ label: 'Abuse / coercion', score: 25 });
  } else if (allTypes.has('property') && !hasRomantic && !hasOccupational) {
    reasons.push({ label: 'Power imbalance', score: 10 });
  }

  if (hasRomantic) {
    if (hasFamily) {
      let incestScore = incestSeverity.score;
      let incestLabel = incestSeverity.label;

      if (crushDynamic.oneSidedCrushOnly) {
        incestScore = Math.round(incestScore * ONE_SIDED_CRUSH_ONLY_INCEST_MULTIPLIER * 10) / 10;
        incestLabel = `${incestLabel} (one-sided crush only)`;
      } else if (crushDynamic.crushOnly) {
        incestScore = Math.round(incestScore * CRUSH_ONLY_INCEST_MULTIPLIER * 10) / 10;
        incestLabel = `${incestLabel} (crush only)`;
      }

      reasons.push({ label: incestLabel, score: incestScore });
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

    if ((aMinor || bMinor) && ageGap != null && ageGap > 0) {
      const gapScore = Math.min(ageGap, 15);
      reasons.push({ label: `Age gap (${ageGap})`, score: gapScore });
    }

    if (hasOccupational) {
      reasons.push({ label: 'Occupational dynamic in romance', score: OCCUPATIONAL_ROMANCE_SCORE });
    }

    if (hasEducationalDynamic) {
      reasons.push({ label: 'Teacher/student dynamic in romance', score: EDUCATIONAL_ROMANCE_SCORE });
    }
  }

  if (hasExPartner && sharedChildrenCount > 0) {
    reasons.push({
      label: `Ex-partners with shared child x${sharedChildrenCount}`,
      score: EX_PARTNER_WITH_CHILD_SCORE,
    });
  }

  const baseTotal = reasons.reduce((sum, r) => sum + r.score, 0);
  let multiplier = 1;
  if (sharedChildrenCount > 0 && (hasRomantic || isAbuse)) {
    const certainSharedChildrenCount = Math.max(0, sharedChildrenCount - ambiguousSharedChildrenCount);
    const bonusFactor = Math.min(
      (certainSharedChildrenCount * SHARED_CHILD_MULTIPLIER_STEP) +
      (ambiguousSharedChildrenCount * SHARED_CHILD_AMBIGUOUS_STEP),
      SHARED_CHILD_MULTIPLIER_MAX_BONUS,
    );
    multiplier = 1 + bonusFactor;
  }

  const total = Math.max(0, Math.round(baseTotal * multiplier * 10) / 10);
  const multiplierBonus = Math.round((total - baseTotal) * 10) / 10;
  if (sharedChildrenCount > 0 && multiplierBonus > 0) {
    reasons.push({
      label: `Shared children x${sharedChildrenCount} (multiplier x${multiplier.toFixed(2)})`,
      score: multiplierBonus,
    });
  }

  if (ambiguousSharedChildrenCount > 0) {
    reasons.push({
      label: `Uncertain parentage x${ambiguousSharedChildrenCount} (reduced child multiplier)`,
      score: 0,
    });
  }

  return {
    total,
    reasons,
    debug: {
      hasFamily,
      hasRomantic,
      hasExPartner,
      isAbuse,
      hasOccupational,
      hasEducationalDynamic,
      crushOnly: crushDynamic.crushOnly,
      oneSidedCrushOnly: crushDynamic.oneSidedCrushOnly,
      incestSeverity: incestSeverity?.kind || null,
      sharedChildrenCount,
      ambiguousSharedChildrenCount,
      sharedChildren,
      ambiguousSharedChildren,
      multiplier,
      labels: [...new Set(allLabels)],
    },
  };
}

export function buildRelationshipPairs(characters) {
  const pairMap = {};
  const charMap = {};
  const parentChildrenMap = {};
  const childParentsMap = {};
  characters.forEach((c) => { charMap[c.id] = c; });

  characters.forEach((character) => {
    if (!character.relationships) return;
    character.relationships.forEach((rel) => {
      const minId = Math.min(rel.from_id, rel.to_id);
      const maxId = Math.max(rel.from_id, rel.to_id);
      const fwdLabel = rel.from_id === minId ? (rel.relationship_type ?? '') : (rel.reciprocal_relationship_type ?? '');
      const revLabel = rel.from_id === minId ? (rel.reciprocal_relationship_type ?? '') : (rel.relationship_type ?? '');

      ingestParentChildFromLabel(parentChildrenMap, childParentsMap, minId, maxId, fwdLabel);
      ingestParentChildFromLabel(parentChildrenMap, childParentsMap, maxId, minId, revLabel);

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
    const swapped = shouldSwapToMaleFirst(charA, charB);
    const displayA = swapped ? charB : charA;
    const displayB = swapped ? charA : charB;
    const displayLabels = swapped ? reverseLabelDirection(labels) : labels;

    const ageGap = displayA.age != null && displayB.age != null ? Math.abs(displayA.age - displayB.age) : null;
    const { sharedChildIds, ambiguousSharedChildIds } = getSharedChildrenDetails(
      parentChildrenMap,
      childParentsMap,
      displayA.id,
      displayB.id,
    );
    const sharedChildren = sharedChildIds.map((childId) => charMap[childId]?.name || `id:${childId}`);
    const ambiguousSharedChildren = ambiguousSharedChildIds.map(
      (childId) => charMap[childId]?.name || `id:${childId}`,
    );
    const moralRisk = computeMoralRisk(
      displayLabels,
      ageGap,
      displayA.age,
      displayB.age,
      sharedChildren,
      ambiguousSharedChildren,
    );
    return {
      charA: displayA,
      charB: displayB,
      labels: displayLabels,
      ageGap,
      sharedChildrenCount: sharedChildren.length,
      moralRisk,
    };
  });
}
