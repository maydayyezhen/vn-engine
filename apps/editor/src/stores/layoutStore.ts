import { reactive } from "vue";

/** 场景预览区当前激活的页签。 */
export type StageTab = "preview" | "flow" | "portrait" | "ui";

/** 中央下方工作区当前激活的页签。 */
export type ScriptDockTab = "script" | "branch" | "timeline" | "animation";

/** 右侧检查器当前激活的页签。 */
export type InspectorTab = "properties" | "characters";

/** 编辑器布局状态。 */
export interface LayoutStoreState {
  /** 场景预览区当前页签。 */
  stageTab: StageTab;
  /** 中央下方工作区当前页签。 */
  scriptDockTab: ScriptDockTab;
  /** 左侧资源管理器是否折叠。 */
  explorerCollapsed: boolean;
  /** 右侧检查器是否折叠。 */
  inspectorCollapsed: boolean;
  /** 右侧检查器当前页签。 */
  inspectorTab: InspectorTab;
  /** 画面预览缩放比例。 */
  previewZoom: number;
}

/** 全局布局状态。 */
export const layoutStore = reactive<LayoutStoreState>({
  stageTab: "preview",
  scriptDockTab: "script",
  explorerCollapsed: false,
  inspectorCollapsed: false,
  inspectorTab: "properties",
  previewZoom: 1
});

/** 切换场景预览区页签。 */
export function setStageTab(stageTab: StageTab): void {
  layoutStore.stageTab = stageTab;
}

/** 切换中央下方工作区页签。 */
export function setScriptDockTab(scriptDockTab: ScriptDockTab): void {
  layoutStore.scriptDockTab = scriptDockTab;
}

/** 切换右侧检查器页签。 */
export function setInspectorTab(inspectorTab: InspectorTab): void {
  layoutStore.inspectorTab = inspectorTab;
}

/** 设置画面预览缩放比例。 */
export function setPreviewZoom(previewZoom: number): void {
  layoutStore.previewZoom = Math.min(1.5, Math.max(0.5, previewZoom));
}
