import { toast } from "react-toastify";
import config from '../../config.json';

export const ShowNotification = (message, severity) => {
    toast[severity](message, config.NOTIFICATIONS);
};