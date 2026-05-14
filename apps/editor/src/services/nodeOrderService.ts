import type { ScriptFile, VNProject } from "@vn-engine/vn-schema";

/** 查找脚本。 */
function findScript(project: VNProject, scriptId: string): ScriptFile | undefined {
  return project.scripts.find((script) => script.id === scriptId);
}

/** 替换指定脚本。 */
function replaceScript(project: VNProject, nextScript: ScriptFile): VNProject {
  return {
    ...project,
    scripts: project.scripts.map((script) => (script.id === nextScript.id ? nextScript : script))
  };
}

/** 判断节点是否可以上移。 */
export function canMoveNodeUp(project: VNProject, scriptId: string, nodeId: string | null): boolean {
  const script = nodeId ? findScript(project, scriptId) : undefined;
  return !!script && script.nodes.findIndex((node) => node.id === nodeId) > 0;
}

/** 判断节点是否可以下移。 */
export function canMoveNodeDown(project: VNProject, scriptId: string, nodeId: string | null): boolean {
  const script = nodeId ? findScript(project, scriptId) : undefined;
  if (!script) return false;
  const index = script.nodes.findIndex((node) => node.id === nodeId);
  return index >= 0 && index < script.nodes.length - 1;
}

/** 上移指定节点。 */
export function moveNodeUp(project: VNProject, scriptId: string, nodeId: string): VNProject {
  if (!canMoveNodeUp(project, scriptId, nodeId)) return project;
  const script = findScript(project, scriptId);
  if (!script) return project;
  const index = script.nodes.findIndex((node) => node.id === nodeId);
  const nodes = [...script.nodes];
  [nodes[index - 1], nodes[index]] = [nodes[index], nodes[index - 1]];
  return replaceScript(project, { ...script, nodes });
}

/** 下移指定节点。 */
export function moveNodeDown(project: VNProject, scriptId: string, nodeId: string): VNProject {
  if (!canMoveNodeDown(project, scriptId, nodeId)) return project;
  const script = findScript(project, scriptId);
  if (!script) return project;
  const index = script.nodes.findIndex((node) => node.id === nodeId);
  const nodes = [...script.nodes];
  [nodes[index], nodes[index + 1]] = [nodes[index + 1], nodes[index]];
  return replaceScript(project, { ...script, nodes });
}
