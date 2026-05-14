import type { VNProject } from "@vn-engine/vn-schema";
import { validateProject } from "@vn-engine/vn-schema";
import { normalizeExportPath } from "./normalizeExportPath";

/** Web 导出校验结果。 */
export interface ExportValidationResult {
  /** 是否允许导出。 */
  valid: boolean;
  /** 阻止导出的错误列表。 */
  errors: string[];
  /** 不阻止导出的警告列表。 */
  warnings: string[];
}

/** 校验项目是否适合导出为 Web 游戏包。 */
export function validateExportProject(project: VNProject): ExportValidationResult {
  const schemaResult = validateProject(project);
  const errors = schemaResult.errors.map((issue) => issue.message);
  const warnings = schemaResult.warnings.map((issue) => issue.message);

  for (const asset of project.assets.items) {
    const normalized = normalizeExportPath(asset.path);
    if (!asset.path.trim()) {
      errors.push(`素材 ${asset.id} 的路径为空。`);
      continue;
    }
    if (!normalized.ok) {
      errors.push(`素材 ${asset.id} 的路径不能导出：${normalized.reason ?? asset.path}`);
    }
    if (normalized.ok && !normalized.exportPath.startsWith("demo-assets/") && !normalized.exportPath.startsWith("assets/")) {
      warnings.push(`素材 ${asset.id} 将按相对路径 ${normalized.exportPath} 导出，当前 demo 脚本不会复制该文件。`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
