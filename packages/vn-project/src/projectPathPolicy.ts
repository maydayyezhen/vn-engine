/** 工程路径规范化结果。 */
export interface ProjectPathPolicyResult {
  /** 路径是否允许写入项目 JSON。 */
  ok: boolean;
  /** 规范化后的工程内相对路径。 */
  path: string;
  /** 拒绝或警告原因。 */
  reason?: string;
}

/** 判断路径是否为 Windows 绝对路径。 */
export function isWindowsAbsolutePath(path: string): boolean {
  return /^[a-zA-Z]:[\\/]/.test(path) || path.startsWith("\\\\");
}

/** 判断路径是否为 POSIX 绝对路径。 */
export function isPosixAbsolutePath(path: string): boolean {
  return path.startsWith("/");
}

/** 判断路径是否为 URL。 */
export function isExternalUrl(path: string): boolean {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(path);
}

/** 判断规范化路径是否包含上级目录逃逸。 */
export function hasParentTraversal(path: string): boolean {
  return path === ".." || path.startsWith("../") || path.includes("/../");
}

/** 将用户输入路径规范化为工程内相对路径。 */
export function normalizeProjectRelativePath(inputPath: string): ProjectPathPolicyResult {
  const trimmed = inputPath.trim();
  if (!trimmed) {
    return { ok: false, path: "", reason: "路径不能为空。" };
  }
  if (trimmed.includes("\0")) {
    return { ok: false, path: "", reason: "路径不能包含非法空字符。" };
  }
  if (isExternalUrl(trimmed)) {
    return { ok: false, path: "", reason: "项目工程路径不能保存外部 URL。" };
  }
  if (isWindowsAbsolutePath(trimmed)) {
    return { ok: false, path: "", reason: "项目工程路径不能保存 Windows 绝对路径。" };
  }
  if (isPosixAbsolutePath(trimmed)) {
    return { ok: false, path: "", reason: "项目工程路径不能保存绝对路径。" };
  }

  let normalized = trimmed.replace(/\\/g, "/");
  while (normalized.startsWith("./")) {
    normalized = normalized.slice(2);
  }
  normalized = normalized.replace(/\/+/g, "/");

  if (!normalized) {
    return { ok: false, path: "", reason: "路径不能为空。" };
  }
  if (hasParentTraversal(normalized)) {
    return { ok: false, path: "", reason: "项目工程路径不能包含上级目录逃逸。" };
  }

  return { ok: true, path: normalized };
}
