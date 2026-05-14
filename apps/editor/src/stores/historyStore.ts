import { computed, reactive } from "vue";
import {
  clearHistory,
  recordHistory,
  redoHistory,
  undoHistory,
  type EditorHistorySnapshot,
  type EditorHistoryState
} from "../services/editorHistoryService";

/** 编辑器历史 store。 */
export const historyStore = reactive<EditorHistoryState>({
  undoStack: [],
  redoStack: [],
  maxLength: 50
});

/** 是否可以撤销。 */
export const canUndo = computed(() => historyStore.undoStack.length > 0);

/** 是否可以重做。 */
export const canRedo = computed(() => historyStore.redoStack.length > 0);

/** 记录编辑前历史。 */
export function pushHistory(snapshot: EditorHistorySnapshot): void {
  recordHistory(historyStore, snapshot);
}

/** 执行撤销。 */
export function popUndo(snapshot: EditorHistorySnapshot): EditorHistorySnapshot | null {
  return undoHistory(historyStore, snapshot);
}

/** 执行重做。 */
export function popRedo(snapshot: EditorHistorySnapshot): EditorHistorySnapshot | null {
  return redoHistory(historyStore, snapshot);
}

/** 清空历史。 */
export function resetHistory(): void {
  clearHistory(historyStore);
}
