/** Web 导出包格式标识。 */
export const WEB_EXPORT_FORMAT = "vn-engine-web-export";

/** Web 导出包格式版本。 */
export const WEB_EXPORT_VERSION = "0.1.0";

/** 单个素材在 Web 导出包中的引用信息。 */
export interface ExportAssetRef {
  /** 素材 id。 */
  assetId: string;
  /** 素材类型。 */
  assetType: string;
  /** 项目中记录的原始路径。 */
  sourcePath: string;
  /** 导出包内相对路径。 */
  exportPath: string;
  /** 是否属于当前 Web demo public 目录可复制素材。 */
  existsInDemoPublic?: boolean;
}

/** Web 导出清单。 */
export interface WebExportManifest {
  /** 固定导出格式。 */
  exportFormat: typeof WEB_EXPORT_FORMAT;
  /** 导出格式版本。 */
  exportVersion: string;
  /** ISO 格式导出时间。 */
  exportedAt: string;
  /** 项目 id。 */
  projectId: string;
  /** 项目名称。 */
  projectName: string;
  /** 导出包中的项目包路径。 */
  projectBundlePath: string;
  /** 素材引用列表。 */
  assetRefs: ExportAssetRef[];
  /** 导出警告。 */
  warnings: string[];
}
