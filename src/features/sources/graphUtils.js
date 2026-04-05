import { PLACEHOLDER_IMAGE_URL } from './constants';

const GRAPH_LABEL_MEASURE_CONTEXT = typeof document !== 'undefined'
  ? document.createElement('canvas').getContext('2d')
  : null;

export function getCharacterImageUrl(remoteImageId) {
  return remoteImageId
    ? `https://cdn.kirino.sh/i/${remoteImageId}.png`
    : PLACEHOLDER_IMAGE_URL;
}

export function measureLabelWidth(label) {
  if (!GRAPH_LABEL_MEASURE_CONTEXT || !label) {
    return 1;
  }

  GRAPH_LABEL_MEASURE_CONTEXT.font = '1px Sans-Serif';
  return GRAPH_LABEL_MEASURE_CONTEXT.measureText(label).width || 1;
}

export function getImageCrop(image) {
  const width = image?.naturalWidth || image?.width || 0;
  const height = image?.naturalHeight || image?.height || 0;

  if (!width || !height) {
    return null;
  }

  if (width > height) {
    const sourceWidth = height;
    return {
      sx: (width - sourceWidth) / 2,
      sy: 0,
      sWidth: sourceWidth,
      sHeight: height,
    };
  }

  const sourceHeight = width;
  return {
    sx: 0,
    sy: 0,
    sWidth: width,
    sHeight: sourceHeight,
  };
}
