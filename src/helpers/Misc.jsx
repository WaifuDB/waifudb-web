import { toast } from "react-toastify";
import config from '../../config.json';

export const ShowNotification = (message, severity) => {
    toast[severity](message, config.NOTIFICATIONS);
};

const euCupSizes = ['AA', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
const usCupSizes = ['AA', 'A', 'B', 'C', 'D', 'DD', 'DDD/F', 'G', 'H', 'I', 'J', 'K'];
export function getCupSizeLabel(cupLetter) {
    const cup = cupLetter.toString().toUpperCase().trim();

    // Validate input
    if (!cup || !/^[A-Z]+$/.test(cup)) {
        return 'Invalid cup size';
    }

    // Strict 5-label classification
    if (['AAA', 'AA'].includes(cup)) return 'Flat';
    if (['A', 'B'].includes(cup)) return 'Small';
    if (['C', 'D'].includes(cup)) return 'Medium';
    if (['DD', 'E', 'F'].includes(cup)) return 'Large';

    // Everything else is Huge
    return 'Huge';
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