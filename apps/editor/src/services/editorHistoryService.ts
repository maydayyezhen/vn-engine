import type { VNProject } from "@vn-engine/vn-schema";

/** 编辑历史快照。 */
export interface EditorHistorySnapshot {
  /** 项目数据快照。 */
  project: VNProject;
  /** 快照中的选中脚本。 */
  selectedScriptId: string;
  /** 快照中的选中节点。 */
  selectedNodeId: string | null;
}

/** 编辑历史状态。 */
export interface EditorHistoryState {
  /** 撤销栈。 */
  undoStack: EditorHistorySnapshot[];
  /** 重做栈。 */
  redoStack: EditorHistorySnapshot[];
  /** 最大历史条数。 */
  maxLength: number;
}

/** 深拷贝历史快照。 */
export function cloneHistorySnapshot(snapshot: EditorHistorySnapshot): EditorHistorySnapshot {
  return JSON.parse(JSON.stringify(snapshot)) as EditorHistorySnapshot;
}

/** 判断两个历史快照是否相同。 */
function isSameSnapshot(left: EditorHistorySnapshot, right: EditorHistorySnapshot): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

/** 记录一次编辑前历史。 */
export function recordHistory(state: EditorHistoryState, snapshot: EditorHistorySnapshot): void {
  const cloned = cloneHistorySnapshot(snapshot);
  const last = state.undoStack[state.undoStack.length - 1];
  if (last && isSameSnapshot(last, cloned)) return;
  state.undoStack.push(cloned);
  if (state.undoStack.length > state.maxLength) state.undoStack.shift();
  state.redoStack = [];
}

/** 撤销到上一个历史快照。 */
export function undoHistory(state: EditorHistoryState, current: EditorHistorySnapshot): EditorHistorySnapshot | null {
  const previous = state.undoStack.pop();
  if (!previous) return null;
  state.redoStack.push(cloneHistorySnapshot(current));
  return cloneHistorySnapshot(previous);
}

/** 重做到下一个历史快照。 */
export function redoHistory(state: EditorHistoryState, current: EditorHistorySnapshot): EditorHistorySnapshot | null {
  const next = state.redoStack.pop();
  if (!next) return null;
  state.undoStack.push(cloneHistorySnapshot(current));
  return cloneHistorySnapshot(next);
}

/** 清空编辑历史。 */
export function clearHistory(state: EditorHistoryState): void {
  state.undoStack = [];
  state.redoStack = [];
}
