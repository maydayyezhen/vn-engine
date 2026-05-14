import type { VNProject } from "@vn-engine/vn-schema";
import type { ProjectBundle } from "./ProjectBundle";
import { cloneProject } from "./projectClone";
import { PROJECT_FORMAT } from "./projectVersion";

/** 判断对象是否是普通记录。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 判断对象是否具有 VNProject 的最低字段形状。 */
function isProjectLike(value: unknown): value is VNProject {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.version === "string" &&
    typeof value.startScriptId === "string" &&
    isRecord(value.assets) &&
    Array.isArray(value.characters) &&
    Array.isArray(value.scripts)
  );
}

/** 判断对象是否是 ProjectBundle。 */
function isProjectBundle(value: unknown): value is ProjectBundle {
  if (!isRecord(value)) return false;
  return typeof value.format === "string" && "project" in value;
}

/** 从 JSON 字符串反序列化工程，兼容 ProjectBundle 和裸 VNProject。 */
export function deserializeProject(jsonText: string): VNProject {
  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "未知 JSON 解析错误";
    throw new Error(`JSON 解析失败：${reason}`);
  }

  if (isProjectBundle(parsed)) {
    if (parsed.format !== PROJECT_FORMAT) {
      throw new Error(`不支持的项目格式：${parsed.format}`);
    }
    if (!isProjectLike(parsed.project)) {
      throw new Error("ProjectBundle 中的 project 字段不是有效的 VNProject 结构。");
    }
    return cloneProject(parsed.project);
  }

  if (isProjectLike(parsed)) {
    return cloneProject(parsed);
  }

  throw new Error("导入内容不是 ProjectBundle，也不是裸 VNProject。");
}
