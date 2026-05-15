import type { AnimationModule } from "../types/AnimationModule";

/** 校验动画模块必要字段，供注册表使用。 */
export function validateAnimationModuleShape(animation: AnimationModule): string[] {
  const errors: string[] = [];
  if (!animation.id) errors.push("动画 id 不能为空。");
  if (!animation.name) errors.push(`动画 ${animation.id || "(unknown)"} 缺少 name。`);
  if (!animation.category) errors.push(`动画 ${animation.id || "(unknown)"} 缺少 category。`);
  if (!Array.isArray(animation.targetSlots)) errors.push(`动画 ${animation.id || "(unknown)"} targetSlots 必须是数组。`);
  if (!animation.paramsSchema || typeof animation.paramsSchema !== "object") errors.push(`动画 ${animation.id || "(unknown)"} 缺少 paramsSchema。`);
  if (typeof animation.play !== "function") errors.push(`动画 ${animation.id || "(unknown)"} 缺少 play 函数。`);
  return errors;
}
