import type { ValidationResult } from "@vn-engine/vn-schema";
import type { AnimationModule } from "../types/AnimationModule";
import { validateAnimationModuleShape } from "../utils/animationGuard";

/** 代码型动画模块注册表。 */
export class AnimationRegistry {
  /** 动画 id 到模块的映射。 */
  private readonly modules = new Map<string, AnimationModule>();

  /** 注册单个动画模块。 */
  register(animation: AnimationModule): void {
    const validation = this.validateAnimationModule(animation);
    if (!validation.valid) {
      throw new Error(validation.errors.map((issue) => issue.message).join("; "));
    }
    if (this.modules.has(animation.id)) throw new Error(`动画 id 重复：${animation.id}`);
    this.modules.set(animation.id, animation);
  }

  /** 批量注册动画模块。 */
  registerMany(animations: AnimationModule[]): void {
    for (const animation of animations) this.register(animation);
  }

  /** 根据 id 获取动画模块。 */
  get(animationId: string): AnimationModule | undefined {
    return this.modules.get(animationId);
  }

  /** 列出全部动画模块。 */
  list(): AnimationModule[] {
    return [...this.modules.values()];
  }

  /** 按分类列出动画模块。 */
  listByCategory(category: AnimationModule["category"]): AnimationModule[] {
    return this.list().filter((animation) => animation.category === category);
  }

  /** 校验动画模块元数据。 */
  validateAnimationModule(animation: AnimationModule): ValidationResult {
    const errors = validateAnimationModuleShape(animation).map((message) => ({ level: "error" as const, message }));
    return { valid: errors.length === 0, errors, warnings: [] };
  }
}
