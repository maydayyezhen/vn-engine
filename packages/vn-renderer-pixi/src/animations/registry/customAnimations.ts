import type { AnimationModule } from "../types/AnimationModule";
import { exampleCustomAnimation } from "../custom/example.customAnimation";

/** 自定义动画模块列表；只注册可信 TypeScript 代码。 */
export const customAnimations: AnimationModule[] = [exampleCustomAnimation];
