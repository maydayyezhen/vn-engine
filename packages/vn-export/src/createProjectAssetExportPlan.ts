import type { VNProject } from "@vn-engine/vn-schema";
import { collectProjectAssetRefs } from "./collectProjectAssetRefs";

/** 工程素材导出复制计划。 */
export interface ProjectAssetExportPlanItem {
  /** 素材 id。 */
  assetId: string;
  /** 工程内源素材相对路径。 */
  sourcePath: string;
  /** Web 导出包内目标相对路径。 */
  exportPath: string;
}

/** 为桌面端或 Node 脚本创建素材复制计划，不直接读取文件系统。 */
export function createProjectAssetExportPlan(project: VNProject): ProjectAssetExportPlanItem[] {
  return collectProjectAssetRefs(project)
    .filter((asset) => !!asset.exportPath)
    .map((asset) => ({
      assetId: asset.assetId,
      sourcePath: asset.sourcePath,
      exportPath: asset.exportPath
    }));
}
