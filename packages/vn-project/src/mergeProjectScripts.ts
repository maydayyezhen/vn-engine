import type { ScriptFile, VNProject } from "@vn-engine/vn-schema";
import type { VNProjectMainFile } from "./splitProjectScripts";

/** 判断脚本条目是否已经包含完整节点数据。 */
function isFullScriptFile(script: unknown): script is ScriptFile {
  return !!script && typeof script === "object" && Array.isArray((script as { nodes?: unknown }).nodes);
}

/** 合并 project.vnproj.json 主文件和 scripts/*.vn.json 脚本文件。 */
export function mergeProjectScripts(projectFile: VNProjectMainFile | VNProject, scripts: ScriptFile[]): VNProject {
  const embeddedScripts = (projectFile.scripts as unknown[]).filter(isFullScriptFile);
  const mergedScripts = scripts.length > 0 ? scripts : embeddedScripts;

  return {
    ...projectFile,
    scripts: mergedScripts.map((script) => ({
      ...script,
      nodes: script.nodes.map((node) => ({ ...node }))
    }))
  };
}
