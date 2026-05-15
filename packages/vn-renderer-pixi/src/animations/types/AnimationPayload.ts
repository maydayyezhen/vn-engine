import type { AnimationTargetRef, AnimationTargets } from "@vn-engine/vn-schema";

/** 动画模块运行时收到的目标和参数。 */
export interface AnimationPayload {
  /** 一次性动画效果 id。 */
  effectId: string;
  /** 动画模块 id。 */
  animationId: string;
  /** 动画目标映射。 */
  targets: AnimationTargets;
  /** 已合并默认值后的参数。 */
  params: Record<string, unknown>;
}

/** 已解析的单个动画目标引用。 */
export interface ResolvedAnimationTarget extends AnimationTargetRef {
  /** 目标槽位 key。 */
  key: string;
}
