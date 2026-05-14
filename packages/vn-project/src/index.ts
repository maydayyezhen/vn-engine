export type { ProjectBundle } from "./ProjectBundle";
export {
  ASSETS_DIRECTORY_NAME,
  getAssetDirectoryForType,
  PROJECT_DIRECTORY_LAYOUT,
  PROJECT_FILE_NAME,
  SCRIPTS_DIRECTORY_NAME,
  STANDARD_PROJECT_DIRECTORIES,
  type ProjectDirectoryLayout
} from "./ProjectDirectoryLayout";
export { cloneProject } from "./projectClone";
export { createDefaultProject, type CreateDefaultProjectOptions } from "./createDefaultProject";
export { deserializeProject } from "./deserializeProject";
export { mergeProjectScripts } from "./mergeProjectScripts";
export { normalizeProjectAssetPath } from "./normalizeProjectAssetPath";
export {
  hasParentTraversal,
  isExternalUrl,
  isPosixAbsolutePath,
  isWindowsAbsolutePath,
  normalizeProjectRelativePath,
  type ProjectPathPolicyResult
} from "./projectPathPolicy";
export { PROJECT_FORMAT, PROJECT_FORMAT_VERSION } from "./projectVersion";
export { serializeProject } from "./serializeProject";
export {
  addScript,
  createSafeScriptId,
  createScriptFile,
  deleteScript,
  ensureProjectHasScript,
  normalizeScriptNames,
  renameScript,
  selectFallbackScript,
  setStartScript
} from "./scriptManagement";
export { splitProjectScripts, type ProjectScriptReference, type VNProjectMainFile } from "./splitProjectScripts";

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
