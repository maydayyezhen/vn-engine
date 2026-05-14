import type { VNProject } from "@vn-engine/vn-schema";

/** 深拷贝工程数据，用于去除响应式代理和避免修改原对象。 */
export function cloneProject(project: VNProject): VNProject {
  return JSON.parse(JSON.stringify(project)) as VNProject;
}
