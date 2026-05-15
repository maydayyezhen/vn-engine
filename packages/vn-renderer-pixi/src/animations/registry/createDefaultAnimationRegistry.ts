import { AnimationRegistry } from "./AnimationRegistry";
import { builtinAnimations } from "./builtinAnimations";
import { customAnimations } from "./customAnimations";

/** 创建包含内置动画和可信 custom 动画的默认注册表。 */
export function createDefaultAnimationRegistry(): AnimationRegistry {
  const registry = new AnimationRegistry();
  registry.registerMany([...builtinAnimations, ...customAnimations]);
  return registry;
}
