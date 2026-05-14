import { ref } from "vue";
import type { RuntimeSnapshot } from "@vn-engine/vn-core";
import { HistoryManager, type HistoryEntry } from "@vn-engine/vn-ui-runtime";

/** 创建播放器历史记录状态。 */
export function usePlayerHistory() {
  /** 历史管理器。 */
  const manager = new HistoryManager(100);
  /** 当前历史条目。 */
  const entries = ref<HistoryEntry[]>([]);

  /** 根据快照写入历史。 */
  function pushSnapshot(snapshot: RuntimeSnapshot): void {
    if (snapshot.type !== "dialogue" || !snapshot.text || !snapshot.currentNodeId) return;
    manager.push({
      id: `${snapshot.currentScriptId}:${snapshot.currentNodeId}:${Date.now()}`,
      speakerName: snapshot.speaker ?? undefined,
      text: snapshot.text,
      scriptId: snapshot.currentScriptId,
      nodeId: snapshot.currentNodeId,
      createdAt: new Date().toISOString()
    });
    entries.value = manager.list();
  }

  /** 写入玩家选择历史。 */
  function pushChoice(snapshot: RuntimeSnapshot, choiceText: string): void {
    if (!snapshot.currentNodeId) return;
    manager.push({
      id: `${snapshot.currentScriptId}:${snapshot.currentNodeId}:choice:${Date.now()}`,
      speakerName: "选择",
      text: choiceText,
      scriptId: snapshot.currentScriptId,
      nodeId: snapshot.currentNodeId,
      createdAt: new Date().toISOString()
    });
    entries.value = manager.list();
  }

  /** 清空历史。 */
  function clear(): void {
    manager.clear();
    entries.value = [];
  }

  return {
    entries,
    pushSnapshot,
    pushChoice,
    clear
  };
}
