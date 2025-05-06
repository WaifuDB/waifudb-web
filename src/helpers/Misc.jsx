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
    if(!Array.isArray(relationships) || relationships.length === 0) {
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

export function getRelationshipColor(relationshipLabel){
    // Love-related become pink, family-related become blue, and the rest are grey
    const loveRelated = ['boyfriend', 'girlfriend', 'husband', 'wife', 'fiance', 'fiancee', 'lover', 'partner', 'spouse', 'significant other', 'love interest', 'loveinterest', 'crush', 'sweetheart', 'darling', 'beloved', 'soulmate'];
    const familyRelated = ['mother', 'father', 'brother', 'sister', 'uncle', 'aunt', 'grandmother', 'grandfather', 'cousin'];
    const propertyRelated = ['master', 'slave', 'owner', 'pet'];
    const other = ['friend', 'enemy', 'rival', 'acquaintance', 'colleague', 'classmate', 'partner'];

    //consider stuff like step- or step, and special characters like in fiancee (é)
    let _relationshipLabel = relationshipLabel.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

    const loveRegex = new RegExp(loveRelated.join('|'), 'i');
    const familyRegex = new RegExp(familyRelated.join('|'), 'i');
    const propertyRegex = new RegExp(propertyRelated.join('|'), 'i');
    const otherRegex = new RegExp(other.join('|'), 'i');

    const relationship = _relationshipLabel.toLowerCase().trim();
    if (loveRegex.test(relationship)) {
        return '#FF69B4'; // Pink
    } else if (familyRegex.test(relationship)) {
        return '#ADD8E6'; // Light Blue
    } else if (otherRegex.test(relationship)) {
        return '#D3D3D3'; // Light Grey
    } else if (propertyRegex.test(relationship)) {
        return '#8B0000'; // Dark Red
    } else {
        return '#FFFFFF'; // Default to white for unknown relationships
    }
}