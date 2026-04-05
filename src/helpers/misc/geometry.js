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
}

export function createTopAlignedSquareImage(sourceImage) {
  const size = Math.min(sourceImage.width, sourceImage.height);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const sx = (sourceImage.width - size) / 2;
  const sy = 0;

  ctx.drawImage(
    sourceImage,
    sx,
    sy,
    size,
    size,
    0,
    0,
    size,
    size,
  );

  const croppedImage = new Image();
  croppedImage.crossOrigin = 'anonymous';
  croppedImage.src = canvas.toDataURL('image/png');
  return croppedImage;
}
