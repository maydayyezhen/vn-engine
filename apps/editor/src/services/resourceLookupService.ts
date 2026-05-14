import type { AssetItem, AssetType, Character, CharacterExpression, VNProject } from "@vn-engine/vn-schema";

/** 根据素材 id 查找素材。 */
export function findAssetById(project: VNProject, assetId: string | undefined): AssetItem | undefined {
  if (!assetId) return undefined;
  return project.assets.items.find((asset) => asset.id === assetId);
}

/** 根据角色 id 查找角色。 */
export function findCharacterById(project: VNProject, characterId: string | undefined): Character | undefined {
  if (!characterId) return undefined;
  return project.characters.find((character) => character.id === characterId);
}

/** 查找角色表情。 */
export function findCharacterExpression(project: VNProject, characterId: string | undefined, expressionId: string | undefined): CharacterExpression | undefined {
  const character = findCharacterById(project, characterId);
  if (!character || !expressionId) return undefined;
  return (character.expressions ?? []).find((expression) => expression.id === expressionId);
}

/** 获取指定类型素材。 */
export function getAssetsByType(project: VNProject, type: AssetType): AssetItem[] {
  return project.assets.items.filter((asset) => asset.type === type);
}

/** 获取背景选项。 */
export function getBackgroundOptions(project: VNProject): AssetItem[] {
  return getAssetsByType(project, "background");
}

/** 获取音频选项。 */
export function getAudioOptions(project: VNProject): AssetItem[] {
  return project.assets.items.filter((asset) => ["bgm", "sound", "sfx", "voice"].includes(asset.type));
}

/** 获取角色选项。 */
export function getCharacterOptions(project: VNProject): Character[] {
  return project.characters;
}

/** 获取指定角色的表情选项。 */
export function getExpressionOptions(project: VNProject, characterId: string | undefined): CharacterExpression[] {
  return findCharacterById(project, characterId)?.expressions ?? [];
}
