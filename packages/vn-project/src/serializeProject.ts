import type { VNProject } from "@vn-engine/vn-schema";
import type { ProjectBundle } from "./ProjectBundle";
import { cloneProject } from "./projectClone";
import { PROJECT_FORMAT, PROJECT_FORMAT_VERSION } from "./projectVersion";

/** 将完整工程序列化为 ProjectBundle JSON 字符串。 */
export function serializeProject(project: VNProject): string {
  const bundle: ProjectBundle = {
    format: PROJECT_FORMAT,
    formatVersion: PROJECT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    project: cloneProject(project)
  };

  return JSON.stringify(bundle, null, 2);
}
