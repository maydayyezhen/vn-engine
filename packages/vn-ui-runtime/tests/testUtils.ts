import type { RuntimeSnapshot, RuntimeState } from "@vn-engine/vn-core";
import type { SaveStorageAdapter } from "../src";

/** 创建测试用内存存储。 */
export function createMemoryStorage(): SaveStorageAdapter {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    }
  };
}

/** 创建测试运行时状态。 */
export function createTestState(): RuntimeState {
  return {
    currentScriptId: "start",
    currentNodeId: "dialogue-1",
    currentNodeIndex: 1,
    backgroundAssetId: "bg-classroom",
    background: { assetId: "bg-classroom", transition: "none", transitionDurationMs: 300 },
    characters: [{ characterId: "lincheng", expression: "smile", assetId: "lincheng-smile", position: "center", scale: 1, opacity: 1, zIndex: 0, flipX: false, enterEffect: "none", transitionDurationMs: 300 }],
    camera: { zoom: 1, offsetX: 0, offsetY: 0, shake: false, shakeIntensity: 0, durationMs: 0 },
    pendingEffects: [],
    audio: { bgm: "bgm-main" },
    variables: { stay: true },
    isWaitingChoice: false,
    isEnded: false
  };
}

/** 创建测试快照。 */
export function createTestSnapshot(): RuntimeSnapshot {
  return {
    type: "dialogue",
    currentScriptId: "start",
    currentNodeId: "dialogue-1",
    backgroundAssetId: "bg-classroom",
    background: { assetId: "bg-classroom", transition: "none", transitionDurationMs: 300 },
    characters: [{ characterId: "lincheng", expression: "smile", assetId: "lincheng-smile", position: "center", scale: 1, opacity: 1, zIndex: 0, flipX: false, enterEffect: "none", transitionDurationMs: 300 }],
    camera: { zoom: 1, offsetX: 0, offsetY: 0, shake: false, shakeIntensity: 0, durationMs: 0 },
    pendingEffects: [],
    speaker: "林澄",
    text: "这里是测试文本。",
    choices: [],
    variables: { stay: true },
    audio: { bgm: "bgm-main" },
    isEnded: false
  };
}
