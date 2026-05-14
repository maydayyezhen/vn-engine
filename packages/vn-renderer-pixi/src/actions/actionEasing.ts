import type { VNEasing } from "@vn-engine/vn-schema";

/** 解析动作缓动类型，非法或缺失时回退为 linear。 */
export function normalizeActionEasing(easing: VNEasing | undefined): VNEasing {
  if (easing === "easeIn" || easing === "easeOut" || easing === "easeInOut") return easing;
  return "linear";
}

/** 应用基础缓动曲线。 */
export function applyActionEasing(progress: number, easing: VNEasing | undefined): number {
  const value = Math.max(0, Math.min(progress, 1));
  const normalized = normalizeActionEasing(easing);
  if (normalized === "easeIn") return value * value;
  if (normalized === "easeOut") return 1 - (1 - value) * (1 - value);
  if (normalized === "easeInOut") return value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;
  return value;
}
