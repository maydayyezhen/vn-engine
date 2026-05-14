import type { AssetLibrary } from "./asset";
import type { Character } from "./character";
import type { ScriptFile } from "./script";

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
  /** 工程剧本文件列表。 */
  scripts: ScriptFile[];
}

/** 工程校验结果。 */
export interface ValidationResult {
  /** 是否通过校验。 */
  valid: boolean;
  /** 错误信息列表。 */
  errors: string[];
  /** 警告信息列表。 */
  warnings: string[];
}
