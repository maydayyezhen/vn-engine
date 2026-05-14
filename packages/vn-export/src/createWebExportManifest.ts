import type { VNProject } from "@vn-engine/vn-schema";
import { collectProjectAssetRefs } from "./collectProjectAssetRefs";
import { validateExportProject } from "./validateExportProject";
import { WEB_EXPORT_FORMAT, WEB_EXPORT_VERSION, type WebExportManifest } from "./WebExportManifest";

/** 为项目创建 Web 导出清单。 */
export function createWebExportManifest(project: VNProject, exportedAt = new Date().toISOString()): WebExportManifest {
  const validation = validateExportProject(project);
  return {
    exportFormat: WEB_EXPORT_FORMAT,
    exportVersion: WEB_EXPORT_VERSION,
    exportedAt,
    projectId: project.id,
    projectName: project.name,
    projectBundlePath: "game/project.bundle.json",
    assetRefs: collectProjectAssetRefs(project),
    warnings: validation.warnings
  };
}
