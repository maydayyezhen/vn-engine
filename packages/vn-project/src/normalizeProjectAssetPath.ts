import { normalizeProjectRelativePath, type ProjectPathPolicyResult } from "./projectPathPolicy";

/** 将素材路径规范化为可写入项目 JSON 的工程内相对路径。 */
export function normalizeProjectAssetPath(path: string): ProjectPathPolicyResult {
  return normalizeProjectRelativePath(path);
}
