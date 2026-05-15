/** 素材类型，用于区分图片、音频和其他资源。 */
export type AssetType = "background" | "character" | "prop" | "bgm" | "sound" | "sfx" | "voice" | "image" | "other";

/** 视觉小说工程中的单个素材条目。 */
export interface AssetItem {
  /** 素材唯一标识。 */
  id: string;
  /** 素材显示名称。 */
  name: string;
  /** 素材类型。 */
  type: AssetType;
  /** 素材相对工程根目录的路径或占位路径。 */
  path: string;
  /** 素材说明。 */
  description?: string;
  /** 素材备注。 */
  note?: string;
}

/** 视觉小说工程的素材库。 */
export interface AssetLibrary {
  /** 工程内全部素材列表。 */
  items: AssetItem[];
}

/** 按素材类型筛选素材。 */
export function getAssetsByType(library: AssetLibrary, type: AssetType): AssetItem[] {
  return library.items.filter((asset) => asset.type === type);
}

/** 根据素材 id 查找素材。 */
export function findAssetById(library: AssetLibrary, assetId: string | undefined): AssetItem | undefined {
  if (!assetId) return undefined;
  return library.items.find((asset) => asset.id === assetId);
}
