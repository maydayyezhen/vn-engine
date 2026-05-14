import type { StoryAudioChannel, VNAction, VNActionType, VNProject } from "@vn-engine/vn-schema";

/** 生成动作 id。 */
export function createActionId(prefix = "action"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** 深拷贝 JSON 兼容动作数据。 */
function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** 创建指定类型的默认动作。 */
export function createDefaultAction(type: VNActionType, project: VNProject): VNAction {
  const id = createActionId(type);
  const firstCharacter = project.characters[0];
  const firstExpression = firstCharacter?.expressions?.[0];
  const firstBackground = project.assets.items.find((asset) => asset.type === "background");
  const firstAudio = project.assets.items.find((asset) => ["bgm", "sound", "sfx", "voice"].includes(asset.type));

  if (type === "wait") return { id, type, durationMs: 500, easing: "linear" };
  if (type === "scene") return { id, type, backgroundAssetId: firstBackground?.id ?? "", transition: "fade", durationMs: 300, easing: "linear" };
  if (type === "showCharacter") {
    return {
      id,
      type,
      characterId: firstCharacter?.id ?? "",
      expression: firstExpression?.id,
      position: "center",
      scale: 1,
      opacity: 1,
      zIndex: 0,
      flipX: false,
      enterEffect: "fadeIn",
      durationMs: 300,
      easing: "linear"
    };
  }
  if (type === "hideCharacter") return { id, type, characterId: firstCharacter?.id ?? "", exitEffect: "fadeOut", durationMs: 300, easing: "linear" };
  if (type === "moveCharacter") return { id, type, characterId: firstCharacter?.id ?? "", position: "center", scale: 1, opacity: 1, zIndex: 0, flipX: false, durationMs: 500, easing: "easeInOut" };
  if (type === "changeExpression") return { id, type, characterId: firstCharacter?.id ?? "", expression: firstExpression?.id ?? "", durationMs: 200, easing: "linear" };
  if (type === "camera") return { id, type, zoom: 1, offsetX: 0, offsetY: 0, shake: false, shakeIntensity: 0, durationMs: 300, easing: "easeOut" };
  if (type === "playAudio") return { id, type, channel: (firstAudio?.type === "sfx" ? "sound" : firstAudio?.type ?? "bgm") as StoryAudioChannel, assetId: firstAudio?.id ?? "", loop: firstAudio?.type === "bgm", durationMs: 0, easing: "linear" };
  if (type === "stopAudio") return { id, type, channel: "bgm", durationMs: 0, easing: "linear" };
  return { id, type: "parallel", actions: [createDefaultAction("moveCharacter", project), createDefaultAction("camera", project)], durationMs: 300, easing: "linear" };
}

/** 复制动作并为动作和所有子动作生成新 id。 */
export function duplicateAction(action: VNAction): VNAction {
  const duplicated = { ...cloneJson(action), id: createActionId(action.type) } as VNAction;
  if (duplicated.type === "parallel") {
    duplicated.actions = duplicated.actions.map((child) => duplicateAction(child));
  }
  return duplicated;
}
