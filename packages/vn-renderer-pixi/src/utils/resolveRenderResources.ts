import type { RuntimeSnapshot } from "@vn-engine/vn-core";
import type { AssetItem, VNProject } from "@vn-engine/vn-schema";
import type { ResolvedAudioResource, ResolvedBackgroundResource, ResolvedCharacterResource, ResolvedRenderResources } from "../types";

/** 根据素材 id 查找素材。 */
function findAsset(project: VNProject, assetId: string | undefined): AssetItem | undefined {
  if (!assetId) return undefined;
  return project.assets.items.find((asset) => asset.id === assetId);
}

/** 解析当前背景资源。 */
export function resolveBackgroundResource(project: VNProject, snapshot: RuntimeSnapshot): ResolvedBackgroundResource {
  const asset = findAsset(project, snapshot.backgroundAssetId);
  return {
    assetId: snapshot.backgroundAssetId,
    name: asset?.name ?? snapshot.backgroundAssetId ?? "未设置背景",
    path: asset?.path,
    asset,
    exists: Boolean(asset)
  };
}

/** 解析当前角色资源列表。 */
export function resolveCharacterResources(project: VNProject, snapshot: RuntimeSnapshot): ResolvedCharacterResource[] {
  return snapshot.characters.map((display) => {
    const character = project.characters.find((item) => item.id === display.characterId);
    const expression = character?.expressions?.find((item) => item.id === display.expression);
    const assetId = expression?.assetId ?? display.assetId;
    const asset = findAsset(project, assetId);

    return {
      characterId: display.characterId,
      characterName: character?.displayName || character?.name || display.characterId,
      expressionId: display.expression,
      expressionName: expression?.name || display.expression || "默认",
      assetId,
      path: asset?.path,
      position: display.position ?? "center",
      asset,
      exists: Boolean(character && (!display.expression || expression) && asset)
    };
  });
}

/** 解析当前音频资源列表，本轮仅用于调试显示。 */
export function resolveAudioResources(project: VNProject, snapshot: RuntimeSnapshot): ResolvedAudioResource[] {
  return Object.entries(snapshot.audio)
    .filter(([, assetId]) => Boolean(assetId))
    .map(([channel, assetId]) => {
      const asset = findAsset(project, assetId);
      return {
        channel,
        assetId,
        name: asset?.name ?? assetId,
        path: asset?.path,
        asset,
        exists: Boolean(asset)
      };
    });
}

/** 解析渲染当前快照所需的全部资源。 */
export function resolveRenderResources(project: VNProject, snapshot: RuntimeSnapshot): ResolvedRenderResources {
  return {
    background: resolveBackgroundResource(project, snapshot),
    characters: resolveCharacterResources(project, snapshot),
    audio: resolveAudioResources(project, snapshot)
  };
}
