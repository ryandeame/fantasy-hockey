import { Asset } from 'expo-asset';
import { Image as RNImage } from 'react-native';

export type CollisionPoint = {
  x: number;
  y: number;
};

export type CollisionRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export type RenderedAlphaMask = {
  alpha: Uint8ClampedArray;
  height: number;
  width: number;
};

const maskCache = new Map<string, Promise<RenderedAlphaMask | null>>();

function isWebCanvasAvailable() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function getImageUri(source: number) {
  const assetUri = Asset.fromModule(source).uri;

  if (assetUri) {
    return assetUri;
  }

  const resolvedSource = RNImage.resolveAssetSource(source);

  return resolvedSource?.uri;
}

function resolveBrowserImageUri(uri: string) {
  if (typeof window === 'undefined') {
    return uri;
  }

  return new URL(uri, window.location.href).href;
}

function getMaskCacheKey(source: number, width: number, height: number) {
  return `${source}:${width}x${height}`;
}

async function loadRenderedAlphaMask(source: number, width: number, height: number) {
  if (!isWebCanvasAvailable() || width <= 0 || height <= 0) {
    return null;
  }

  const uri = getImageUri(source);

  if (!uri) {
    return null;
  }

  const image = new window.Image();
  const imageUri = resolveBrowserImageUri(uri);

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Unable to load mask image: ${uri}`));
    image.src = imageUri;
  });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    return null;
  }

  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const rgba = context.getImageData(0, 0, width, height).data;
  const alpha = new Uint8ClampedArray(width * height);

  for (let rgbaIndex = 3, alphaIndex = 0; rgbaIndex < rgba.length; rgbaIndex += 4) {
    alpha[alphaIndex] = rgba[rgbaIndex];
    alphaIndex += 1;
  }

  return {
    alpha,
    height,
    width,
  };
}

export function getRenderedAlphaMask(source: number, rect: CollisionRect) {
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const cacheKey = getMaskCacheKey(source, width, height);
  const cachedMask = maskCache.get(cacheKey);

  if (cachedMask) {
    return cachedMask;
  }

  const maskPromise = loadRenderedAlphaMask(source, width, height).catch(() => null);
  maskCache.set(cacheKey, maskPromise);

  return maskPromise;
}

function renderedPointHasAlpha({
  alphaThreshold = 24,
  mask,
  point,
  rect,
}: {
  alphaThreshold?: number;
  mask: RenderedAlphaMask;
  point: CollisionPoint;
  rect: CollisionRect;
}) {
  const pixelX = Math.floor(point.x - rect.left);
  const pixelY = Math.floor(point.y - rect.top);

  if (
    pixelX < 0 ||
    pixelX >= mask.width ||
    pixelY < 0 ||
    pixelY >= mask.height
  ) {
    return false;
  }

  return mask.alpha[pixelY * mask.width + pixelX] > alphaThreshold;
}

export function getRenderedAlphaAtPoint({
  mask,
  point,
  rect,
}: {
  mask: RenderedAlphaMask;
  point: CollisionPoint;
  rect: CollisionRect;
}) {
  const pixelX = Math.floor(point.x - rect.left);
  const pixelY = Math.floor(point.y - rect.top);

  if (
    pixelX < 0 ||
    pixelX >= mask.width ||
    pixelY < 0 ||
    pixelY >= mask.height
  ) {
    return null;
  }

  return mask.alpha[pixelY * mask.width + pixelX];
}

export function circleTouchesRenderedAlphaMask({
  alphaThreshold,
  mask,
  point,
  radius,
  rect,
}: {
  alphaThreshold?: number;
  mask: RenderedAlphaMask;
  point: CollisionPoint;
  radius: number;
  rect: CollisionRect;
}) {
  const samplePoints = [
    point,
    { x: point.x - radius, y: point.y },
    { x: point.x + radius, y: point.y },
    { x: point.x, y: point.y - radius },
    { x: point.x, y: point.y + radius },
    { x: point.x - radius * 0.7, y: point.y - radius * 0.7 },
    { x: point.x + radius * 0.7, y: point.y - radius * 0.7 },
    { x: point.x - radius * 0.7, y: point.y + radius * 0.7 },
    { x: point.x + radius * 0.7, y: point.y + radius * 0.7 },
  ];

  return samplePoints.some((samplePoint) =>
    renderedPointHasAlpha({
      alphaThreshold,
      mask,
      point: samplePoint,
      rect,
    }),
  );
}
