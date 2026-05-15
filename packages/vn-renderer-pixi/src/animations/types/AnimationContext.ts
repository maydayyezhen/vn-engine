import type { Container, Sprite } from "pixi.js";

/** 动画模块可访问的受限渲染上下文。 */
export interface AnimationContext {
  /** 获取指定角色的显示对象。 */
  getCharacterSprite(characterId: string): Sprite | undefined;
  /** 获取指定物品的显示对象。 */
  getPropSprite(propId: string): Sprite | undefined;
  /** 获取当前背景显示对象。 */
  getBackgroundSprite(assetId?: string): Container | undefined;
  /** 获取受镜头影响的画面容器。 */
  getCameraContainer(): Container;
  /** 获取屏幕特效层。 */
  getScreenEffectLayer(): Container;
  /** 获取粒子层。 */
  getParticleLayer(): Container;
  /** 获取当前舞台尺寸。 */
  getStageSize(): { width: number; height: number };
  /** 等待指定毫秒。 */
  wait(ms: number): Promise<void>;
  /** 写入调试日志。 */
  log(message: string): void;
}
