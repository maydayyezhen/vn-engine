import type { ScriptFile, VNProject } from "@vn-engine/vn-schema";

/** project.vnproj.json 中保存的脚本索引条目。 */
export interface ProjectScriptReference {
  /** 脚本 id。 */
  id: string;
  /** 脚本显示名称。 */
  name: string;
  /** 脚本文件相对路径。 */
  path: string;
}

/** 拆分后的工程主文件结构。 */
export type VNProjectMainFile = Omit<VNProject, "scripts"> & {
  /** 脚本索引列表，真实节点写入 scripts/*.vn.json。 */
  scripts: ProjectScriptReference[];
};

/** 拆分完整工程为主文件和独立脚本文件。 */
export function splitProjectScripts(project: VNProject): { projectFile: VNProjectMainFile; scripts: ScriptFile[] } {
  return {
    projectFile: {
      ...project,
      scripts: project.scripts.map((script) => ({
        id: script.id,
        name: script.name,
        path: `scripts/${script.id}.vn.json`
      }))
    },
    scripts: project.scripts.map((script) => ({
      ...script,
      nodes: script.nodes.map((node) => ({ ...node }))
    }))
  };
}
