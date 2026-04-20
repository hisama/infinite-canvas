import * as THREE from "three";
import { hashString, seededRandom } from "~/src/utils";
import { CHUNK_SIZE } from "./constants";
import type { PlaneData } from "./types";

const MAX_PLANE_CACHE = 256;
const planeCache = new Map<string, PlaneData[]>();

const touchPlaneCache = (key: string) => {
  const v = planeCache.get(key);
  if (!v) {
    return;
  }

  planeCache.delete(key);
  planeCache.set(key, v);
};

const evictPlaneCache = () => {
  while (planeCache.size > MAX_PLANE_CACHE) {
    const firstKey = planeCache.keys().next().value as string | undefined;
    if (!firstKey) break;
    planeCache.delete(firstKey);
  }
};

export const getChunkUpdateThrottleMs = (isZooming: boolean, zoomSpeed: number): number => {
  if (zoomSpeed > 1.0) {
    return 500;
  }

  if (isZooming) {
    return 400;
  }

  return 100;
};

export const getMediaDimensions = (media: HTMLImageElement | undefined) => {
  const width = media instanceof HTMLImageElement ? media.naturalWidth || media.width : undefined;
  const height = media instanceof HTMLImageElement ? media.naturalHeight || media.height : undefined;
  return { width, height };
};

const ITEMS_PER_CHUNK = 5;

/**
 * Converts chunk coordinates to a single integer index, spreading chunks
 * across the media list so adjacent chunks get different artworks.
 * Uses a simple spatial hash that mixes x/y/z to avoid obvious repetition.
 */
const chunkToMediaOffset = (cx: number, cy: number, cz: number, mediaLength: number): number => {
  // Large primes to spread the 3D grid across the media array
  const raw = Math.abs(cx * 73856093 ^ cy * 19349663 ^ cz * 83492791);
  return (raw * ITEMS_PER_CHUNK) % mediaLength;
};

export const generateChunkPlanes = (cx: number, cy: number, cz: number, mediaLength = 1): PlaneData[] => {
  const planes: PlaneData[] = [];
  const seed = hashString(`${cx},${cy},${cz}`);
  const mediaOffset = chunkToMediaOffset(cx, cy, cz, mediaLength);

  // ITEMS_PER_CHUNK = 5
  for (let i = 0; i < ITEMS_PER_CHUNK; i++) {
    const s = seed + i * 1000;
    const r = (n: number) => seededRandom(s + n);
    const size = 12 + r(4) * 8;

    planes.push({
      id: `${cx}-${cy}-${cz}-${i}`,
      position: new THREE.Vector3(
        cx * CHUNK_SIZE + r(0) * CHUNK_SIZE,
        cy * CHUNK_SIZE + r(1) * CHUNK_SIZE,
        cz * CHUNK_SIZE + r(2) * CHUNK_SIZE
      ),
      scale: new THREE.Vector3(size, size, 1),
      // Each plane in a chunk gets a unique index offset from the chunk's base
      mediaIndex: (mediaOffset + i) % mediaLength,
    });
  }

  return planes;
};

export const generateChunkPlanesCached = (cx: number, cy: number, cz: number, mediaLength = 1): PlaneData[] => {
  const key = `${cx},${cy},${cz},${mediaLength}`;
  const cached = planeCache.get(key);
  if (cached) {
    touchPlaneCache(key);
    return cached;
  }

  const planes = generateChunkPlanes(cx, cy, cz, mediaLength);
  planeCache.set(key, planes);
  evictPlaneCache();
  return planes;
};

export const shouldThrottleUpdate = (lastUpdateTime: number, throttleMs: number, currentTime: number): boolean => {
  return currentTime - lastUpdateTime >= throttleMs;
};
