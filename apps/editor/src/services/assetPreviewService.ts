import type { AssetItem } from "@vn-engine/vn-schema";

const showcaseAssetUrls = import.meta.glob("../../../../examples/showcase-game/assets/**/*", {
  eager: true,
  query: "?url",
  import: "default"
}) as Record<string, string>;

const demoAssetUrls = import.meta.glob("../../../../apps/player/public/demo-assets/**/*", {
  eager: true,
  query: "?url",
  import: "default"
}) as Record<string, string>;

/** Previewable image asset types in the editor asset library. */
const imageTypes = new Set(["background", "character", "prop", "image"]);

/** Previewable audio asset types in the editor asset library. */
const audioTypes = new Set(["bgm", "sound", "sfx", "voice"]);

/** Normalize a project asset path for lookup. */
function normalizeAssetPath(path: string): string {
  return path.replaceAll("\\", "/").replace(/^\/+/, "");
}

/** Find a Vite-imported asset URL by its path suffix. */
function findImportedAssetUrl(assetMap: Record<string, string>, suffix: string): string | undefined {
  const normalizedSuffix = normalizeAssetPath(suffix);
  const entry = Object.entries(assetMap).find(([key]) => normalizeAssetPath(key).endsWith(normalizedSuffix));
  return entry?.[1];
}

/** Resolve a browser-usable preview URL for known demo and showcase asset paths. */
export function resolveAssetPreviewUrl(path?: string): string | undefined {
  if (!path) return undefined;
  const normalized = normalizeAssetPath(path);

  if (/^(https?:|blob:|data:)/.test(path)) return path;

  if (normalized.startsWith("showcase-assets/")) {
    return findImportedAssetUrl(showcaseAssetUrls, normalized.replace("showcase-assets/", ""));
  }

  if (normalized.startsWith("demo-assets/")) {
    return findImportedAssetUrl(demoAssetUrls, normalized.replace("demo-assets/", ""));
  }

  if (normalized.startsWith("assets/")) {
    return findImportedAssetUrl(showcaseAssetUrls, normalized.replace("assets/", ""));
  }

  return path;
}

/** Return whether an asset can be previewed as an image. */
export function isImagePreviewAsset(asset: AssetItem): boolean {
  return imageTypes.has(asset.type);
}

/** Return whether an asset can be previewed as audio. */
export function isAudioPreviewAsset(asset: AssetItem): boolean {
  return audioTypes.has(asset.type);
}
