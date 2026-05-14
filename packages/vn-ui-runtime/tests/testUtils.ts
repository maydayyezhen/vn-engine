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
    characters: [{ characterId: "lincheng", expression: "smile", assetId: "lincheng-smile", position: "center" }],
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
    characters: [{ characterId: "lincheng", expression: "smile", assetId: "lincheng-smile", position: "center" }],
    speaker: "林澄",
    text: "这里是测试文本。",
    choices: [],
    variables: { stay: true },
    audio: { bgm: "bgm-main" },
    isEnded: false
  };
}
