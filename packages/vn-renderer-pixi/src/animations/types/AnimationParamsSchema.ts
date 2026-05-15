/** 动画参数表单项类型。 */
export type AnimationParamType = "number" | "string" | "boolean" | "select" | "color";

/** 动画参数下拉选项。 */
export interface AnimationParamOption {
  /** 显示文本。 */
  label: string;
  /** 实际保存值。 */
  value: string | number | boolean;
}

/** 单个动画参数的编辑器元数据。 */
export interface AnimationParamSchemaItem {
  /** 参数输入类型。 */
  type: AnimationParamType;
  /** 参数显示名称。 */
  label: string;
  /** 默认值。 */
  default?: unknown;
  /** 数字最小值。 */
  min?: number;
  /** 数字最大值。 */
  max?: number;
  /** 数字步进。 */
  step?: number;
  /** select 参数的选项。 */
  options?: AnimationParamOption[];
  /** 参数说明。 */
  description?: string;
}

/** 动画参数表单 schema。 */
export type AnimationParamsSchema = Record<string, AnimationParamSchemaItem>;
