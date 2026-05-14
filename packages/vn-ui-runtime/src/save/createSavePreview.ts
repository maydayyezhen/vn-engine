import type { RuntimeSnapshot, RuntimeState } from "@vn-engine/vn-core";
import type { SaveSlot } from "./SaveSlot";

/** 根据当前快照和状态创建存档槽位。 */
export function createSavePreview(slotId: string, snapshot: RuntimeSnapshot, state: RuntimeState, savedAt = new Date().toISOString()): SaveSlot {
  const previewText = snapshot.text || (snapshot.type === "choices" ? "选项节点" : "剧情已结束");
  return {
    slotId,
    title: `存档 ${slotId}`,
    savedAt,
    previewText,
    speakerName: snapshot.speaker ?? undefined,
    backgroundAssetId: snapshot.backgroundAssetId,
    currentScriptId: state.currentScriptId,
    currentNodeId: state.currentNodeId ?? "",
    state: JSON.parse(JSON.stringify(state)) as RuntimeState
  };
}
