import type { StoryNode } from "./node";

/** 单个结构化 JSON 剧本文件。 */
export interface ScriptFile {
  /** 脚本唯一标识。 */
  id: string;
  /** 脚本显示名称。 */
  name: string;
  /** 该脚本包含的剧情节点列表。 */
  nodes: StoryNode[];
}
