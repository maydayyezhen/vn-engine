import type { ScriptFile, VNProject } from "@vn-engine/vn-schema";
import {
  mergeProjectScripts,
  splitProjectScripts,
  type VNProjectMainFile
} from "@vn-engine/vn-project";
import { isDesktopRuntime } from "./isDesktopRuntime";

/** 桌面桥接层统一返回结果。 */
export interface DesktopBridgeResult<T> {
  /** 操作是否成功。 */
  ok: boolean;
  /** 成功时的结果数据。 */
  data?: T;
  /** 失败时给 UI 展示的错误信息。 */
  message?: string;
}

/** Tauri 侧脚本文件载荷。 */
export interface DesktopScriptFilePayload {
  /** 脚本文件名。 */
  file_name: string;
  /** 脚本 JSON 文本。 */
  json_text: string;
}

/** Tauri 侧工程打开结果。 */
export interface DesktopProjectOpenPayload {
  /** 工程根目录绝对路径，仅用于桌面 UI 显示。 */
  root_path: string;
  /** project.vnproj.json 文本。 */
  project_json: string;
  /** scripts/*.vn.json 文本列表。 */
  scripts: DesktopScriptFilePayload[];
}

/** 编辑器使用的桌面工程打开结果。 */
export interface DesktopProjectOpenResult {
  /** 工程根目录绝对路径，仅用于桌面 UI 显示。 */
  rootPath: string;
  /** 合并后的完整项目数据。 */
  project: VNProject;
}

/** 动态获取 Tauri invoke，避免 Web 模式静态执行失败。 */
async function getInvoke(): Promise<(<T>(command: string, args?: Record<string, unknown>) => Promise<T>) | undefined> {
  if (!isDesktopRuntime()) return undefined;
  const api = await import("@tauri-apps/api/core");
  return api.invoke;
}

/** 将桌面工程载荷组装为完整 VNProject。 */
function parseDesktopProject(payload: DesktopProjectOpenPayload): DesktopProjectOpenResult {
  const projectFile = JSON.parse(payload.project_json) as VNProjectMainFile | VNProject;
  const scripts = payload.scripts.map((script) => JSON.parse(script.json_text) as ScriptFile);
  return {
    rootPath: payload.root_path,
    project: mergeProjectScripts(projectFile, scripts)
  };
}

/** 新建本地工程目录并加载到编辑器。 */
export async function createDesktopProjectDirectory(): Promise<DesktopBridgeResult<DesktopProjectOpenResult>> {
  const invoke = await getInvoke();
  if (!invoke) return { ok: false, message: "需要桌面版才能新建本地工程。" };
  try {
    const payload = await invoke<DesktopProjectOpenPayload>("create_project_directory");
    return { ok: true, data: parseDesktopProject(payload) };
  } catch (error) {
    return { ok: false, message: String(error) };
  }
}

/** 打开已有本地工程目录并加载到编辑器。 */
export async function openDesktopProjectDirectory(): Promise<DesktopBridgeResult<DesktopProjectOpenResult>> {
  const invoke = await getInvoke();
  if (!invoke) return { ok: false, message: "需要桌面版才能打开本地工程。" };
  try {
    const payload = await invoke<DesktopProjectOpenPayload>("open_project_directory");
    return { ok: true, data: parseDesktopProject(payload) };
  } catch (error) {
    return { ok: false, message: String(error) };
  }
}

/** 保存当前项目到已打开的本地工程目录。 */
export async function saveDesktopProject(project: VNProject): Promise<DesktopBridgeResult<void>> {
  const invoke = await getInvoke();
  if (!invoke) return { ok: false, message: "需要桌面版才能保存到本地工程目录。" };
  const split = splitProjectScripts(project);
  const projectJson = JSON.stringify(split.projectFile, null, 2);
  const scripts = split.scripts.map((script) => ({
    file_name: `${script.id}.vn.json`,
    json_text: JSON.stringify(script, null, 2)
  }));
  try {
    await invoke<void>("save_project_file", { projectJson });
    await invoke<void>("save_script_files", { scripts });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: String(error) };
  }
}

/** 获取当前桌面工程根目录。 */
export async function getDesktopProjectRoot(): Promise<DesktopBridgeResult<string | null>> {
  const invoke = await getInvoke();
  if (!invoke) return { ok: true, data: null };
  try {
    const root = await invoke<string | null>("get_current_project_root");
    return { ok: true, data: root };
  } catch (error) {
    return { ok: false, message: String(error) };
  }
}
