import type { ScriptFile, VNProject } from "@vn-engine/vn-schema";

/** 将文本转换为适合作为脚本 id 的片段。 */
function slugifyScriptName(name: string): string {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return slug || "script";
}

/** 深拷贝 JSON 兼容对象。 */
function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** 为脚本名称生成不冲突的安全脚本 id。 */
export function createSafeScriptId(name: string, existingIds: Iterable<string>): string {
  const used = new Set(existingIds);
  const base = slugifyScriptName(name);
  let candidate = base;
  let index = 2;
  while (used.has(candidate)) {
    candidate = `${base}_${index}`;
    index += 1;
  }
  return candidate;
}

/** 创建一个带旁白占位节点的新脚本。 */
export function createScriptFile(name: string, existingIds: Iterable<string> = []): ScriptFile {
  const id = createSafeScriptId(name, existingIds);
  return {
    id,
    name: name.trim() || id,
    nodes: [
      {
        id: `${id}_start`,
        type: "narration",
        text: "新脚本占位旁白"
      }
    ]
  };
}

/** 确保项目至少包含一个脚本。 */
export function ensureProjectHasScript(project: VNProject): VNProject {
  if (project.scripts.length > 0) return project;
  const script = createScriptFile("start", []);
  return {
    ...project,
    startScriptId: script.id,
    scripts: [script]
  };
}

/** 在脚本删除或切换后选择一个可用脚本 id。 */
export function selectFallbackScript(project: VNProject, preferredScriptId?: string | null): string | null {
  if (preferredScriptId && project.scripts.some((script) => script.id === preferredScriptId)) return preferredScriptId;
  if (project.scripts.some((script) => script.id === project.startScriptId)) return project.startScriptId;
  return project.scripts[0]?.id ?? null;
}

/** 重命名脚本显示名称，不修改脚本 id。 */
export function renameScript(project: VNProject, scriptId: string, name: string): VNProject {
  return {
    ...project,
    scripts: project.scripts.map((script) => (script.id === scriptId ? { ...script, name: name.trim() || script.id } : script))
  };
}

/** 向项目中追加一个新脚本。 */
export function addScript(project: VNProject, name: string): { project: VNProject; script: ScriptFile } {
  const script = createScriptFile(name, project.scripts.map((item) => item.id));
  return {
    script,
    project: {
      ...project,
      scripts: [...project.scripts, script]
    }
  };
}

/** 删除脚本；不允许删除最后一个脚本，删除入口脚本时自动选择新的入口。 */
export function deleteScript(project: VNProject, scriptId: string): { project: VNProject; selectedScriptId: string } {
  if (project.scripts.length <= 1) {
    return { project, selectedScriptId: project.scripts[0]?.id ?? project.startScriptId };
  }
  const scripts = project.scripts.filter((script) => script.id !== scriptId);
  const startScriptId = project.startScriptId === scriptId ? scripts[0]?.id ?? project.startScriptId : project.startScriptId;
  const nextProject = { ...project, startScriptId, scripts };
  return {
    project: nextProject,
    selectedScriptId: selectFallbackScript(nextProject, startScriptId) ?? startScriptId
  };
}

/** 设置项目入口脚本。 */
export function setStartScript(project: VNProject, scriptId: string): VNProject {
  if (!project.scripts.some((script) => script.id === scriptId)) return project;
  return { ...project, startScriptId: scriptId };
}

/** 复制项目并补齐缺失脚本名称。 */
export function normalizeScriptNames(project: VNProject): VNProject {
  const cloned = cloneJson(project);
  return {
    ...cloned,
    scripts: cloned.scripts.map((script) => ({ ...script, name: script.name || script.id }))
  };
}
