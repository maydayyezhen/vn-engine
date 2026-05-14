import { reactive } from "vue";

/** 编辑器界面状态。 */
export interface EditorStoreState {
  /** 当前选中的节点 id。 */
  selectedNodeId: string | null;
}

/** 全局编辑器界面 store。 */
export const editorStore = reactive<EditorStoreState>({
  selectedNodeId: "scene-classroom"
});
