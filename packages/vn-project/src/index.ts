export type { ProjectBundle } from "./ProjectBundle";
export { cloneProject } from "./projectClone";
export { deserializeProject } from "./deserializeProject";
export { PROJECT_FORMAT, PROJECT_FORMAT_VERSION } from "./projectVersion";
export { serializeProject } from "./serializeProject";

/** 本地工程文件清单，描述工程入口和脚本目录。 */
export interface ProjectFileManifest {
  /** 工程根目录路径。 */
  rootPath: string;
  /** 工程入口文件路径。 */
  projectFile: string;
  /** 剧本文件目录路径。 */
  scriptsDir: string;
  /** 素材目录路径。 */
  assetsDir: string;
}
