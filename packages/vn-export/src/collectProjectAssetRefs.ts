import type { VNProject } from "@vn-engine/vn-schema";
import type { ExportAssetRef } from "./WebExportManifest";
import { normalizeExportPath } from "./normalizeExportPath";

/** 从项目素材库收集 Web 导出素材引用。 */
export function collectProjectAssetRefs(project: VNProject): ExportAssetRef[] {
  return project.assets.items.map((asset) => {
    const normalized = normalizeExportPath(asset.path);
    return {
      assetId: asset.id,
      assetType: asset.type,
      sourcePath: asset.path,
      exportPath: normalized.exportPath,
      existsInDemoPublic: normalized.ok && normalized.exportPath.startsWith("demo-assets/")
    };
  });
}
