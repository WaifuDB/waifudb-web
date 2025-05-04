import config from '../../config.json';

export function getAPIUrl() {
  return config.DEVELOPER_MODE ? config.API_URL_DEV : config.API_URL_PROD;
}