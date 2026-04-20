import * as THREE from "three";
import type { MediaItem } from "./types";

const textureCache = new Map<string, THREE.Texture>();
const loadCallbacks = new Map<string, Set<(tex: THREE.Texture) => void>>();
// Track active Image loads so we can cancel them if the plane leaves view before loading completes
const pendingLoads = new Map<string, HTMLImageElement>();
const loader = new THREE.TextureLoader();

const isTextureLoaded = (tex: THREE.Texture): boolean => {
  const img = tex.image as HTMLImageElement | undefined;
  return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0;
};

export const getTexture = (item: MediaItem, onLoad?: (texture: THREE.Texture) => void): THREE.Texture => {
  const key = item.url;
  const existing = textureCache.get(key);

  if (existing) {
    if (onLoad) {
      if (isTextureLoaded(existing)) {
        onLoad(existing);
      } else {
        loadCallbacks.get(key)?.add(onLoad);
      }
    }
    return existing;
  }

  const callbacks = new Set<(tex: THREE.Texture) => void>();
  if (onLoad) callbacks.add(onLoad);
  loadCallbacks.set(key, callbacks);

  const texture = loader.load(
    key,
    (tex) => {
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.anisotropy = 4;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;

      pendingLoads.delete(key);

      loadCallbacks.get(key)?.forEach((cb) => {
        try {
          cb(tex);
        } catch (err) {
          console.error(`Callback failed: ${JSON.stringify(err)}`);
        }
      });
      loadCallbacks.delete(key);
    },
    undefined,
    (err) => {
      pendingLoads.delete(key);
      console.error("Texture load failed:", key, err);
    }
  );

  // Track the underlying Image element for potential cancellation
  if (texture.image instanceof HTMLImageElement) {
    pendingLoads.set(key, texture.image);
  }

  textureCache.set(key, texture);
  return texture;
};

/**
 * Removes a load callback for a texture without cancelling the download.
 * The texture stays cached if already loading — only the callback is dropped.
 */
export const cancelTextureCallback = (item: MediaItem, onLoad: (tex: THREE.Texture) => void): void => {
  loadCallbacks.get(item.url)?.delete(onLoad);
};

/**
 * Returns true if the texture for this item is already fully loaded in cache.
 */
export const isTextureCached = (item: MediaItem): boolean => {
  const tex = textureCache.get(item.url);
  return tex !== undefined && isTextureLoaded(tex);
};

/**
 * Returns the cached texture synchronously if available, otherwise null.
 */
export const getCachedTexture = (item: MediaItem): THREE.Texture | null => {
  return textureCache.get(item.url) ?? null;
};
