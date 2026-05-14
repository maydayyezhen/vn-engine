import { reactive } from "vue";
import type { ScriptFile, VNProject } from "@vn-engine/vn-schema";
import { loadDemoProject } from "../services/projectLoadService";

/** 工程数据 store 状态。 */
export interface ProjectStoreState {
  /** 当前工程数据。 */
  project: VNProject;
  /** 当前脚本。 */
  currentScript: ScriptFile | undefined;
}

/** 创建工程数据 store。 */
function createProjectStore(): ProjectStoreState {
  const project = loadDemoProject();
  return reactive({
    project,
    currentScript: project.scripts[0]
  });
}

/** 全局工程数据 store。 */
export const projectStore = createProjectStore();
