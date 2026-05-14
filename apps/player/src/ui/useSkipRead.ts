import { ref } from "vue";
import type { RuntimeSnapshot } from "@vn-engine/vn-core";

const READ_KEY = "vn-engine:read-nodes";

/** 创建已读节点记录和快进判断。 */
export function useSkipRead(storage: Storage) {
  /** 已读节点集合。 */
  const readNodeIds = ref<Set<string>>(loadReadNodes(storage));

  /** 标记当前对话或旁白节点为已读。 */
  function markRead(snapshot: RuntimeSnapshot): void {
    if (snapshot.type !== "dialogue" || !snapshot.currentNodeId || !snapshot.text) return;
    readNodeIds.value = new Set([...readNodeIds.value, snapshot.currentNodeId]);
    storage.setItem(READ_KEY, JSON.stringify([...readNodeIds.value]));
  }

  /** 判断当前快照是否是可快进的已读文本。 */
  function canSkip(snapshot: RuntimeSnapshot): boolean {
    return snapshot.type === "dialogue" && !!snapshot.currentNodeId && readNodeIds.value.has(snapshot.currentNodeId) && !snapshot.isEnded;
  }

  return {
    readNodeIds,
    markRead,
    canSkip
  };
}

/** 从存储中读取已读节点集合。 */
function loadReadNodes(storage: Storage): Set<string> {
  try {
    const parsed = JSON.parse(storage.getItem(READ_KEY) ?? "[]") as unknown;
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set();
  }
}
