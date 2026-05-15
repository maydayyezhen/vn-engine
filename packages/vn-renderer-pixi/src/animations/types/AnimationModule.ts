import type { AnimationTargetType } from "@vn-engine/vn-schema";
import type { AnimationContext } from "./AnimationContext";
import type { AnimationParamsSchema } from "./AnimationParamsSchema";
import type { AnimationPayload } from "./AnimationPayload";

/** 动画目标槽位定义，用于编辑器生成目标选择表单。 */
export interface AnimationTargetSlot {
  /** 目标槽位 key。 */
  key: string;
  /** 目标槽位显示名称。 */
  label: string;
  /** 目标类型。 */
  type: AnimationTargetType;
  /** 是否必填。 */
  required: boolean;
  /** 目标说明。 */
  description?: string;
}

/** 代码型动画模块。 */
export interface AnimationModule {
  /** 全局唯一动画 id。 */
  id: string;
  /** 通用中文动画名。 */
  name: string;
  /** 动画分类。 */
  category: "character" | "background" | "camera" | "screen" | "particle" | "prop" | "group";
  /** 动画说明。 */
  description?: string;
  /** 检索标签。 */
  tags?: string[];
  /** 目标槽位列表。 */
  targetSlots: AnimationTargetSlot[];
  /** 参数 schema。 */
  paramsSchema: AnimationParamsSchema;
  /** 执行动画。 */
  play(ctx: AnimationContext, payload: AnimationPayload): Promise<void>;
}
