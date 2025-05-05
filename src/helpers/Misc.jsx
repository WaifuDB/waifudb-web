import { toast } from "react-toastify";
import config from '../../config.json';

export const ShowNotification = (message, severity) => {
    toast[severity](message, config.NOTIFICATIONS);
};

export const getCupSize = (bust, waist, hip) => {
    if (!bust || !waist || !hip) return null;

    const bustSize = parseFloat(bust);
    const waistSize = parseFloat(waist);
    const hipSize = parseFloat(hip);

    if (isNaN(bustSize) || isNaN(waistSize) || isNaN(hipSize)) return null;

    const cupSize = (bustSize - waistSize); // Convert cm to inches

    if (cupSize < 0) return "Invalid";
    if (cupSize < 1) return "AA";
    if (cupSize < 2) return "A";
    if (cupSize < 3) return "B";
    if (cupSize < 4) return "C";
    if (cupSize < 5) return "D";
    if (cupSize < 6) return "DD/E";
    if (cupSize < 7) return "F";
    if (cupSize < 8) return "G";
    if (cupSize < 9) return "H";

    return "Unknown";
}