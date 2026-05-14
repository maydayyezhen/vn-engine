import type { VNProject } from "@vn-engine/vn-schema";

/** 项目导入导出的完整包结构。 */
export interface ProjectBundle {
  /** 固定格式标识。 */
  format: "vn-engine-project";
  /** 格式版本号。 */
  formatVersion: string;
  /** 导出时间 ISO 字符串。 */
  exportedAt: string;
  /** 完整视觉小说工程数据。 */
  project: VNProject;
}
