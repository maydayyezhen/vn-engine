/** 路径规范化结果。 */
export interface NormalizedExportPath {
  /** 是否可以作为导出包相对路径使用。 */
  ok: boolean;
  /** 规范化后的导出路径。 */
  exportPath: string;
  /** 错误或警告原因。 */
  reason?: string;
}

/** 判断路径是否是 Windows 绝对路径。 */
function isWindowsAbsolutePath(path: string): boolean {
  return /^[a-zA-Z]:[\\/]/.test(path) || path.startsWith("\\\\");
}

/** 判断路径是否是 URL。 */
function isExternalUrl(path: string): boolean {
  return /^https?:\/\//i.test(path);
}

/** 将项目素材路径转换为 Web 导出包内相对路径。 */
export function normalizeExportPath(sourcePath: string): NormalizedExportPath {
  const trimmed = sourcePath.trim();
  if (!trimmed) {
    return { ok: false, exportPath: "", reason: "素材路径为空。" };
  }
  if (trimmed.startsWith("\0")) {
    return { ok: false, exportPath: "", reason: "素材路径包含非法字符。" };
  }
  if (isExternalUrl(trimmed)) {
    return { ok: false, exportPath: "", reason: "Web 导出包暂不支持外部 URL 素材。" };
  }
  if (isWindowsAbsolutePath(trimmed)) {
    return { ok: false, exportPath: "", reason: "Web 导出包不支持 Windows 绝对路径。" };
  }
  if (trimmed.startsWith("/")) {
    if (trimmed.startsWith("/demo-assets/")) {
      return { ok: true, exportPath: trimmed.slice(1).replace(/\\/g, "/") };
    }
    return { ok: false, exportPath: "", reason: "Web 导出包不支持非 demo-assets 的根路径素材。" };
  }
  const normalized = trimmed.replace(/\\/g, "/");
  if (normalized.startsWith("../") || normalized.includes("/../") || normalized === "..") {
    return { ok: false, exportPath: "", reason: "素材路径不能包含上级目录引用。" };
  }
  if (normalized.startsWith("./")) {
    return { ok: true, exportPath: normalized.slice(2) };
  }
  return { ok: true, exportPath: normalized };
}
