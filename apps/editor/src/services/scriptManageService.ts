import type { VNProject } from "@vn-engine/vn-schema";
import { addScript, deleteScript, renameScript, setStartScript } from "@vn-engine/vn-project";

/** 新建脚本并返回新脚本 id。 */
export function createEditorScript(project: VNProject, name: string): { project: VNProject; scriptId: string; nodeId: string | null } {
  const result = addScript(project, name);
  return {
    project: result.project,
    scriptId: result.script.id,
    nodeId: result.script.nodes[0]?.id ?? null
  };
}

/** 重命名脚本显示名称。 */
export function renameEditorScript(project: VNProject, scriptId: string, name: string): VNProject {
  return renameScript(project, scriptId, name);
}

/** 删除脚本并返回安全选择。 */
export function deleteEditorScript(project: VNProject, scriptId: string): { project: VNProject; scriptId: string; nodeId: string | null; changed: boolean } {
  if (project.scripts.length <= 1) {
    const script = project.scripts[0];
    return { project, scriptId: script?.id ?? project.startScriptId, nodeId: script?.nodes[0]?.id ?? null, changed: false };
  }
  const result = deleteScript(project, scriptId);
  const nextScript = result.project.scripts.find((item) => item.id === result.selectedScriptId) ?? result.project.scripts[0];
  return {
    project: result.project,
    scriptId: nextScript.id,
    nodeId: nextScript.nodes[0]?.id ?? null,
    changed: true
  };
}

/** 设置入口脚本。 */
export function setEditorStartScript(project: VNProject, scriptId: string): VNProject {
  return setStartScript(project, scriptId);
}
