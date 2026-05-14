import { reactive } from "vue";
import type { ValidationResult } from "@vn-engine/vn-schema";

/** 编辑器主视图类型。 */
export type EditorView = "script" | "assets" | "characters";

/** 节点属性面板状态。 */
export interface PropertyPanelState {
  /** 面板是否处于展开状态。 */
  expanded: boolean;
}

/** 编辑器界面状态。 */
export interface EditorStoreState {
  /** 当前工程校验结果。 */
  validationResult: ValidationResult;
  /** 是否存在未保存的内存态修改。 */
  dirty: boolean;
  /** 右侧属性面板状态。 */
  propertyPanel: PropertyPanelState;
  /** 当前编辑器主视图。 */
  activeView: EditorView;
}

/** 全局编辑器界面 store。 */
export const editorStore = reactive<EditorStoreState>({
  validationResult: {
    valid: true,
    errors: [],
    warnings: []
  },
  dirty: false,
  propertyPanel: {
    expanded: true
  },
  activeView: "script"
});

/** 设置校验结果。 */
export function setValidationResult(result: ValidationResult): void {
  editorStore.validationResult = result;
}

/** 标记内存态修改状态。 */
export function setDirty(dirty: boolean): void {
  editorStore.dirty = dirty;
}

/** 设置当前主视图。 */
export function setActiveView(activeView: EditorView): void {
  editorStore.activeView = activeView;
}
