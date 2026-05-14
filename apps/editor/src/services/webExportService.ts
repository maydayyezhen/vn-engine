import { collectProjectAssetRefs, createWebExportManifest, normalizeExportPath, validateExportProject } from "@vn-engine/vn-export";
import { serializeProject } from "@vn-engine/vn-project";
import type { VNProject } from "@vn-engine/vn-schema";

/** 编辑器 Web 导出检查结果。 */
export interface WebExportSummary {
  /** 是否允许导出 ProjectBundle。 */
  canExport: boolean;
  /** 阻止导出的错误。 */
  errors: string[];
  /** 导出警告。 */
  warnings: string[];
  /** 素材引用列表。 */
  assetRefs: ReturnType<typeof collectProjectAssetRefs>;
  /** 导出清单预览。 */
  manifest: ReturnType<typeof createWebExportManifest>;
}

/** 创建当前项目的 Web 导出检查摘要。 */
export function createWebExportSummary(project: VNProject): WebExportSummary {
  const validation = validateExportProject(project);
  return {
    canExport: validation.valid,
    errors: validation.errors,
    warnings: validation.warnings,
    assetRefs: collectProjectAssetRefs(project),
    manifest: createWebExportManifest(project)
  };
}

/** 下载 Web 导出使用的 ProjectBundle JSON。 */
export function downloadWebProjectBundle(project: VNProject): void {
  const blob = new Blob([serializeProject(project)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "project.bundle.json";
  link.click();
  URL.revokeObjectURL(url);
}

/** 检查素材路径是否危险。 */
export function isDangerousExportPath(path: string): boolean {
  return !normalizeExportPath(path).ok;
}
