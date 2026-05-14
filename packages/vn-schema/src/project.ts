import type { AssetLibrary } from "./asset";
import type { Character } from "./character";
import type { ScriptFile } from "./script";
import type { VNVariableDefinition } from "./node";

/** 工程校验问题级别。 */
export type ValidationIssueLevel = "error" | "warning";

/** 工程校验问题，便于编辑器定位和展示。 */
export interface ValidationIssue {
  /** 问题级别。 */
  level: ValidationIssueLevel;
  /** 人类可读的问题说明。 */
  message: string;
  /** 关联脚本 id。 */
  scriptId?: string;
  /** 关联节点 id。 */
  nodeId?: string;
}

/** 视觉小说工程根对象。 */
export interface VNProject {
  /** 工程唯一标识。 */
  id: string;
  /** 工程名称。 */
  name: string;
  /** 工程版本号。 */
  version: string;
  /** 起始脚本 id。 */
  startScriptId: string;
  /** 工程素材库。 */
  assets: AssetLibrary;
  /** 工程角色列表。 */
  characters: Character[];
  /** 项目级变量定义列表。 */
  variables?: VNVariableDefinition[];
  /** 工程剧本文件列表。 */
  scripts: ScriptFile[];
}

/** 工程校验结果。 */
export interface ValidationResult {
  /** 是否通过校验。 */
  valid: boolean;
  /** 错误问题列表。 */
  errors: ValidationIssue[];
  /** 警告问题列表。 */
  warnings: ValidationIssue[];
}
