import type { AssetItem, AssetType, VNProject } from "@vn-engine/vn-schema";
import { getAssetsByType as lookupAssetsByType } from "./resourceLookupService";

/** 生成素材 id。 */
function createAssetId(type: AssetType): string {
  return `asset_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** 创建空素材。 */
export function createEmptyAsset(type: AssetType = "image"): AssetItem {
  return {
    id: createAssetId(type),
    name: "新素材",
    type,
    path: "assets/placeholder.png",
    description: ""
  };
}

/** 新增素材。 */
export function addAsset(project: VNProject, asset: AssetItem): VNProject {
  return {
    ...project,
    assets: {
      ...project.assets,
      items: [...project.assets.items, asset]
    }
  };
}

/** 更新素材。 */
export function updateAsset(project: VNProject, assetId: string, patch: Partial<AssetItem>): VNProject {
  return {
    ...project,
    assets: {
      ...project.assets,
      items: project.assets.items.map((asset) => (asset.id === assetId ? { ...asset, ...patch } : asset))
    }
  };
}

/** 删除素材。 */
export function deleteAsset(project: VNProject, assetId: string): VNProject {
  return {
    ...project,
    assets: {
      ...project.assets,
      items: project.assets.items.filter((asset) => asset.id !== assetId)
    }
  };
}

/** 按类型获取素材。 */
export function getAssetsByType(project: VNProject, type: AssetType): AssetItem[] {
  return lookupAssetsByType(project, type);
}
