import { toast } from "react-toastify";
import config from '../../config.json';

export const ShowNotification = (message, severity) => {
    toast[severity](message, config.NOTIFICATIONS);
};

const euCupSizes = ['AA', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
const usCupSizes = ['AA', 'A', 'B', 'C', 'D', 'DD', 'DDD/F', 'G', 'H', 'I', 'J', 'K'];
export function getCupSizeLabel(cupLetter) {
    const cup = cupLetter.toString().toUpperCase().trim();

    // Validate input (Japanese sizes are usually single letters, no AA/DD)
    if (!cup || !/^[A-Z]$/.test(cup)) {
        return 'Invalid cup size';
    }

    // Japanese cup size classification (A = smallest, each letter = +1 cup)
    if (cup === 'A') return 'Flat';
    if (cup === 'B') return 'Small';
    if (['C', 'D'].includes(cup)) return 'Medium';
    if (['E', 'F', 'G'].includes(cup)) return 'Large';
    return 'Huge'; // H+ and beyond
}

//Bust in cm
export function getBreastBandSize(bust, cup_size) {
    // Cup size to cm difference mapping
    const cupSizeMap = {
        'AAA': -7.5,
        'AA': -5,
        'A': -2.5,
        'B': 0,
        'C': 2.5,
        'D': 5,
        'DD': 7.5,
        'E': 7.5,
        'F': 10,
        'FF': 12.5,
        'G': 15,
        "H": 17.5,
        'I': 20,
        'J': 22.5,
        'K': 25,
        'L': 27.5,
        'M': 30,
    };

    // Normalize cup size (accept 'dd' or 'DD')
    const normalizedCupSize = cup_size.toUpperCase();

    // Get the cm difference for the cup size
    const cupDifference = cupSizeMap[normalizedCupSize];

    if (cupDifference === undefined) {
        throw new Error(`Invalid cup size. Must be one of: ${Object.keys(cupSizeMap).join(', ')}, but got ${cup_size}`);
    }

    // Calculate band size (bust size minus cup difference)
    const bandSize = bust - cupDifference;

    // Band sizes are typically even numbers (rounded to nearest even)
    const roundedBandSize = Math.round(bandSize / 2) * 2;

    return roundedBandSize;
}

export function getAgeRangeLabel(age) {
    if (age < 0) return 'Invalid age';
    if (age <= 12) return 'Child';
    if (age <= 18) return 'Teenager';
    if (age <= 30) return 'Young Adult';
    if (age <= 50) return 'Adult';
    return 'Senior';
}

export function getBodyType(height, weight, bust, waist, hips) {
    // Calculate important ratios
    const waistToHipRatio = waist / hips;
    const bustToWaistRatio = bust / waist;

    // Common body type classifications
    if (waistToHipRatio < 0.75 && bustToWaistRatio > 1.2) {
        return "Hourglass";
    } else if (waistToHipRatio < 0.75 && bustToWaistRatio <= 1.2) {
        return "Pear/Triangle";
    } else if (waistToHipRatio >= 0.75 && waistToHipRatio < 0.85 && bust < hips) {
        return "Rectangle/Straight";
    } else if (waistToHipRatio >= 0.85) {
        return "Apple/Round";
    } else if (bust > hips + 5 && bustToWaistRatio > 1.05) {
        return "Inverted Triangle";
    } else {
        return "Could not determine - mixed characteristics";
    }
}

export function getBMI(height, weight) {
    const heightM = height / 100;
    return weight / (heightM * heightM);
}

export function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 24.9) return 'Normal weight';
    if (bmi < 29.9) return 'Overweight';
    return 'Obesity';
}

export function getZodiacSign(birthDate) {
    //birth date is a string like "January 1"
    const [month, day] = birthDate.split(' ');
    const monthNumber = new Date(Date.parse(month + " 1, 2020")).getMonth() + 1; // January is 0, so add 1
    const dayNumber = parseInt(day, 10);

    const zodiacSigns = [
        { name: "Capricorn", start: [12, 22], end: [1, 19] },
        { name: "Aquarius", start: [1, 20], end: [2, 18] },
        { name: "Pisces", start: [2, 19], end: [3, 20] },
        { name: "Aries", start: [3, 21], end: [4, 19] },
        { name: "Taurus", start: [4, 20], end: [5, 20] },
        { name: "Gemini", start: [5, 21], end: [6, 20] },
        { name: "Cancer", start: [6, 21], end: [7, 22] },
        { name: "Leo", start: [7, 23], end: [8, 22] },
        { name: "Virgo", start: [8, 23], end: [9, 22] },
        { name: "Libra", start: [9, 23], end: [10, 22] },
        { name: "Scorpio", start: [10, 23], end: [11, 21] },
        { name: "Sagittarius", start: [11, 22], end: [12, 21] }
    ];

    for (const sign of zodiacSigns) {
        const [startMonth, startDay] = sign.start;
        const [endMonth, endDay] = sign.end;

        if ((monthNumber === startMonth && dayNumber >= startDay) || (monthNumber === endMonth && dayNumber <= endDay)) {
            return sign.name;
        }
    }

    return "Unknown Zodiac Sign";
}

export function getGenderLabel(gender) {
    let label = 'Unknown';
    let symbol = '❓';
    switch (gender) {
        case 'male':
            label = 'Male';
            symbol = '♂️';
            break;
        case 'female':
            label = 'Female';
            symbol = '♀️';
            break;
        case 'non-binary':
            label = 'Non-binary';
            symbol = '⚧️';
            break;
        case 'other':
            label = 'Other';
            symbol = '⚧️';
            break;
        default:
            label = 'Unknown';
            symbol = '❓';
            break;
    }

    return {
        label: label,
        symbol: symbol,
    }
}

export const MODAL_STYLE = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    minWidth: 400,
    padding: 4,
};

export function sortRelationships(relationships) {
    if (!Array.isArray(relationships) || relationships.length === 0) {
        return relationships;
    }
    //A smart way to sort relationships (ie, Mother/Father go above Wife/Husband, Brother/Sister go under Wife/Husband)

    const relationshipOrder = {
        1: ['mother', 'father', 'step-mother', 'step-father'],
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

    // Sort the sorted relationships by order and then by relationship name
    sortedRelationships.sort((a, b) => {
        if (a.order === b.order) {
            return a.relationship.localeCompare(b.relationship);
        }
        return a.order - b.order;
    });

    // Combine the sorted and unsorted relationships
    return [...sortedRelationships.map(item => item.relationship), ...unsortedRelationships];
}

const loveRelated = ['boyfriend', 'girlfriend', 'husband', 'wife', 'fiance', 'fiancee', 'fiancée', 'lover', 'partner', 'spouse', 'significant other', 'sweetheart', 'darling', 'beloved', 'soulmate'];
const potentialLoveRelated = ['harem candidate', 'haremcandidate', 'love interest', 'loveinterest', 'crush'];
const familyRelated = ['relative', 'mother', 'father', 'brother', 'sister', 'uncle', 'aunt', 'grandmother', 'grandfather', 'cousin', 'daughter', 'son', 'creator', 'creation', 'ward', 'guardian'];
const propertyRelated = ['rapist', 'victim', 'master', 'slave', 'owner', 'pet', 'maid', 'servant', 'mistress', 'butler'];
const other = ['friend', 'enemy', 'rival', 'acquaintance', 'colleague', 'classmate', 'partner'];

export function getRelationshipColor(relationshipLabel) {
    if (!relationshipLabel) return '#FFFFFF'; // Default to white for unknown relationships
    // Love-related become pink, family-related become blue, and the rest are grey

    //love: #FF69B4 (pink)
    //potential love: #FFB6C1 (light pink)
    //family: #ADD8E6 (light blue)
    //property: #8B0000 (dark red)
    //other: #D3D3D3 (light grey)
    //unknown: #FFFFFF (white)
    //ex-relationships: #A9A9A9 (dark grey)

    let color = '#FFFFFF'; // Default to white for unknown relationships

    let relationship = relationshipLabel.toLowerCase().trim();
    //remove prefixes like 'step-', 'step ', 'foster-', 'foster ' (not similar to 'ex-')
    // relationship = relationship.replace(/^(step|foster|step |foster )/i, '');
    let is_step = false;
    const prefixes = ['step', 'foster', 'half', 'adoptive', 'in-law', 'in law'];
    // const suffixes = ['in-law', 'in law'];
    for (const prefix of prefixes) {
        if (relationship.startsWith(prefix + '-') || relationship.startsWith(prefix + ' ') || relationship.startsWith(prefix + '') ||
            relationship.endsWith('-' + prefix) || relationship.endsWith(' ' + prefix) || relationship.endsWith(prefix)) {
            relationship = relationship.replace(new RegExp(`^(${prefix}-|${prefix} )`, 'i'), '');
            is_step = true;
        }
    }

    if (loveRelated.includes(relationship)) {
        color = '#FF69B4'; // Pink
    } else if (potentialLoveRelated.includes(relationship)) {
        color = '#FFB6C1'; // Light Pink
    } else if (familyRelated.includes(relationship)) {
        color = '#ADD8E6'; // Light Blue
    } else if (propertyRelated.includes(relationship)) {
        color = '#8B0000'; // Dark Red
    } else if (other.includes(relationship)) {
        color = '#D3D3D3'; // Light Grey
    }

    if (relationship.startsWith('ex-') || relationship.startsWith('ex ') || relationship.startsWith('former ') || relationship === 'divored') {
        color = '#A9A9A9'; // Overrides all
    }

    // If it's a step relationship, append opacity 'aa'
    if (is_step) {
        color = color + 'aa'; // Add opacity to the color
    }

    return color;
}

export function getQuadraticXY(t, sx, sy, cp1x, cp1y, ex, ey) {
    return {
        x: (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cp1x + t * t * ex,
        y: (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cp1y + t * t * ey,
    };
}

export function getQuadraticXYFourWays(
    t,
    sx,
    sy,
    cp1x,
    cp1y,
    cp2x,
    cp2y,
    ex,
    ey,
) {
    return {
        x:
            (1 - t) * (1 - t) * (1 - t) * sx +
            3 * (1 - t) * (1 - t) * t * cp1x +
            3 * (1 - t) * t * t * cp2x +
            t * t * t * ex,
        y:
            (1 - t) * (1 - t) * (1 - t) * sy +
            3 * (1 - t) * (1 - t) * t * cp1y +
            3 * (1 - t) * t * t * cp2y +
            t * t * t * ey,
    };
};

export function createTopAlignedSquareImage(sourceImage) {
    // Determine square size (smallest dimension)
    const size = Math.min(sourceImage.width, sourceImage.height);

    // Create canvas for cropping
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Calculate source coordinates (top-aligned, centered horizontally)
    const sx = (sourceImage.width - size) / 2;
    const sy = 0; // Top alignment

    // Perform the crop
    ctx.drawImage(
        sourceImage,
        sx, sy, size, size, // Source rectangle
        0, 0, size, size    // Destination rectangle
    );

    // Create and return new Image object
    const croppedImage = new Image();
    //cors
    croppedImage.crossOrigin = 'anonymous';
    croppedImage.src = canvas.toDataURL('image/png');
    return croppedImage;
}

const remappableRelationships = [
    { a: "brother", b: "sister", label: "sibling" },
    { a: "brother-in-law", b: "sister-in-law", label: "sibling-in-law" },
    { a: "half-brother", b: "half-sister", label: "half-sibling" },
    { a: "step-brother", b: "step-sister", label: "step-sibling" },
    { a: "adoptive brother", b: "adoptive sister", label: "adoptive sibling" },
    { a: "husband", b: "wife", label: "married" },
    { a: "boyfriend", b: "girlfriend", label: "partner" },
    { a: "ex-boyfriend", b: "ex-girlfriend", label: "ex-partner" },
    { a: "ex-husband", b: "ex-wife", label: "divorced" },
    { a: "fiancée", b: "fiancée", label: "engaged" },
]

//these indicate no real ties other than emotional ones or connections with unknown ties in between (distance relatives for example)
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
]

const removableOpposites = [
    //for example; if maid, remove the opposite 'master' label
    'maid', 'servant', 'slave', 'pet', 'butler',
    '{any}father', '{any}mother', 'creator'
]

export function reprocessRelationshipsForChart(relationships) {
    //this builds a new array for extra data (or remove data)
    //like siblings with shared parents, dont draw the sibling line

    let _relationships = [...relationships];

    remappableRelationships.forEach((relationship) => {
        _relationships.forEach((rel) => {
            if ((rel.labels.forward === relationship.a && rel.labels.reverse === relationship.b) || (rel.labels.forward === relationship.b && rel.labels.reverse === relationship.a)) {
                rel.labels.forward = relationship.label;
                rel.labels.reverse = relationship.label;
                rel.same_labels = true;
            }
        });
    });

    _relationships = _relationships.filter((relationship, index, self) =>
        index === self.findIndex((r) => {
            return (r.from === relationship.from && r.to === relationship.to && r.labels.forward === relationship.labels.forward && r.labels.reverse === relationship.labels.reverse) ||
                (r.from === relationship.to && r.to === relationship.from && r.labels.forward === relationship.labels.reverse && r.labels.reverse === relationship.labels.forward);
        })
    );

    //set opposite relationships to empty string if needed (like master/slave, maid/owner, etc)
    //just set the label to empty string
    _relationships = _relationships.map((relationship) => {
        removableOpposites.forEach((removable) => {
            // if (relationship.labels.forward === removable) {
            //     relationship.labels.reverse = '';
            // }
            // if (relationship.labels.reverse === removable) {
            //     relationship.labels.forward = '';
            // }
            if (relationship.labels.forward?.toLowerCase().includes(removable.replace('{any}', '').toLowerCase())) {
                relationship.labels.reverse = '';
            }
            if (relationship.labels.reverse?.toLowerCase().includes(removable.replace('{any}', '').toLowerCase())) {
                relationship.labels.forward = '';
            }
        });
        return relationship;
    })

    _relationships = _relationships.flatMap(rel => [
        //if the relationship is the same in both directions, only add one of them
        {
            source: rel.from,
            target: rel.to,
            label: rel.labels.forward,
            color: rel.color,
            curvature: rel.curvature,
            same_labels: rel.same_labels,
            distance: rel.distance,
            visualize: rel.visualize === 1 ? true : false,
        },
        ...(rel.same_labels ? [] : [{
            source: rel.to,
            target: rel.from,
            label: rel.labels.reverse,
            color: rel.color,
            curvature: rel.curvature,
            same_labels: rel.same_labels,
            distance: rel.distance,
            visualize: rel.visualize === 1 ? true : false,
        }]),
    ]);

    _relationships = _relationships.filter((relationship) => {
        return relationship.label && relationship.label.trim() !== "";
    });

    // if ex-, step-, foster- or half- is in the relationship, add property 'dashed' to the relationship
    _relationships = _relationships.map((relationship) => {
        let isDashed = false;
        dashableRelationships.forEach((dashable) => {
            if (relationship.label.toLowerCase().includes(dashable.replace('{relationship}', '').toLowerCase())) {
                isDashed = true;
            }
        });
        return { ...relationship, dashed: isDashed };
    });

    return _relationships;
}