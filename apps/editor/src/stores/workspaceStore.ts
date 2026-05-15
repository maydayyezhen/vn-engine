import { reactive } from "vue";

/** 工作台资源选择类型。 */
export type WorkspaceSelectionKind = "project" | "script" | "asset" | "character" | "variable" | "animation" | "node";

/** 工作台当前选择。 */
export interface WorkspaceSelection {
  /** 当前选择对象类型。 */
  kind: WorkspaceSelectionKind;
  /** 当前选择对象 id。 */
  id?: string;
}

/** 工作台状态。 */
export interface WorkspaceStoreState {
  /** 资源管理器搜索关键字。 */
  resourceSearchQuery: string;
  /** 当前选择对象。 */
  selection: WorkspaceSelection;
}

/** 全局工作台状态。 */
export const workspaceStore = reactive<WorkspaceStoreState>({
  resourceSearchQuery: "",
  selection: {
    kind: "project"
  }
});

/** 更新资源管理器搜索关键字。 */
export function setResourceSearchQuery(resourceSearchQuery: string): void {
  workspaceStore.resourceSearchQuery = resourceSearchQuery;
}

/** 更新工作台选择对象。 */
export function setWorkspaceSelection(selection: WorkspaceSelection): void {
  workspaceStore.selection = selection;
}
