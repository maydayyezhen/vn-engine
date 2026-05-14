import { deserializeProject, serializeProject } from "@vn-engine/vn-project";
import type { ValidationResult, VNProject } from "@vn-engine/vn-schema";
import { validateProject } from "@vn-engine/vn-schema";

/** 项目导入成功结果。 */
export interface ProjectImportSuccess {
  /** 是否导入成功。 */
  ok: true;
  /** 导入后的工程。 */
  project: VNProject;
  /** 导入后立即得到的校验结果。 */
  validationResult: ValidationResult;
}

/** 项目导入失败结果。 */
export interface ProjectImportFailure {
  /** 是否导入成功。 */
  ok: false;
  /** 适合 UI 展示的错误信息。 */
  message: string;
}

/** 项目导入结果。 */
export type ProjectImportResult = ProjectImportSuccess | ProjectImportFailure;

/** 将项目序列化为 JSON 字符串。 */
export function exportProjectToJson(project: VNProject): string {
  return serializeProject(project);
}

/** 生成项目导出文件名。 */
export function createProjectExportFileName(project: VNProject): string {
  const safeName = project.name.trim().replace(/[\\/:*?"<>|]/g, "_") || project.id || "vn-project";
  const date = new Date().toISOString().slice(0, 10);
  return `${safeName}_${date}.vnproject.json`;
}

/** 下载项目 JSON 文件。 */
export function downloadProjectJson(project: VNProject, fileName: string): void {
  const jsonText = exportProjectToJson(project);
  const blob = new Blob([jsonText], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/** 读取用户选择的 JSON 文件内容。 */
export function readProjectJsonFile(file: File): Promise<string> {
  return file.text();
}

/** 从 JSON 文本导入项目并立即校验。 */
export function importProjectFromJsonText(jsonText: string): ProjectImportResult {
  try {
    const project = deserializeProject(jsonText);
    return {
      ok: true,
      project,
      validationResult: validateProject(project)
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "导入项目失败。"
    };
  }
}
