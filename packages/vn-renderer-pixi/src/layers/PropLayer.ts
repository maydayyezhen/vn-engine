import { Container, Renderer, Sprite } from "pixi.js";
import { PixiAssetLoader } from "../assets/PixiAssetLoader";
import type { ResolvedPropResource } from "../types";
import { createPlaceholderTexture } from "../utils/createPlaceholderTexture";

/** 物品渲染层，负责独立显示旧信、录音带、照片等道具。 */
export class PropLayer {
  /** PixiJS 容器。 */
  readonly container = new Container();

  /** 当前物品渲染键，用于避免普通对话刷新时重建物品。 */
  private currentRenderKey = "";
  /** 当前物品 id 到显示对象的映射，供动画模块定位目标。 */
  private readonly spritesByPropId = new Map<string, Sprite>();

  /** 创建物品层。 */
  constructor(
    /** 资源加载器。 */
    private readonly loader: PixiAssetLoader,
    /** PixiJS 渲染器。 */
    private readonly renderer: Renderer
  ) {
    this.container.sortableChildren = true;
  }

  /** 根据快照中的物品状态同步显示对象。 */
  async render(props: ResolvedPropResource[]): Promise<void> {
    const sortedProps = [...props].sort((a, b) => a.zIndex - b.zIndex);
    const renderKey = createPropLayerRenderKey(sortedProps);
    if (renderKey === this.currentRenderKey) return;

    const previousSprites = new Map(this.spritesByPropId);
    const nextSprites = new Map<string, Sprite>();
    const nextChildren: Sprite[] = [];

    for (const prop of sortedProps) {
      let sprite = previousSprites.get(prop.propId);
      if (!sprite || sprite.name !== prop.assetId) {
        sprite?.destroy({ children: true });
        const texture = await this.loader.loadTexture(prop.path);
        sprite = texture
          ? new Sprite(texture)
          : new Sprite(createPlaceholderTexture(this.renderer, `${prop.name}\n${prop.assetId}`, 240, 160, 0x6f5a86));
        sprite.anchor.set(0.5);
        sprite.name = prop.assetId;
      }

      sprite.position.set(prop.x, prop.y);
      sprite.scale.set((prop.flipX ? -1 : 1) * prop.scale, prop.scale);
      sprite.alpha = prop.opacity;
      sprite.zIndex = prop.zIndex;
      sprite.rotation = prop.rotation;
      nextSprites.set(prop.propId, sprite);
      nextChildren.push(sprite);
      previousSprites.delete(prop.propId);
    }

    for (const sprite of previousSprites.values()) sprite.destroy({ children: true });
    this.container.removeChildren();
    this.spritesByPropId.clear();
    for (const sprite of nextChildren) {
      this.container.addChild(sprite);
    }
    for (const [propId, sprite] of nextSprites) this.spritesByPropId.set(propId, sprite);
    this.container.sortChildren();
    this.currentRenderKey = renderKey;
  }

  /** 获取指定物品显示对象，供动画模块使用。 */
  getPropSprite(propId: string): Sprite | undefined {
    return this.spritesByPropId.get(propId);
  }

  /** 销毁物品层资源。 */
  destroy(): void {
    for (const sprite of this.spritesByPropId.values()) sprite.destroy({ children: true });
    this.spritesByPropId.clear();
    this.container.removeChildren();
    this.currentRenderKey = "";
  }
}

/** 创建物品层静态渲染键。 */
export function createPropLayerRenderKey(props: ResolvedPropResource[]): string {
  return JSON.stringify(
    props.map((prop) => ({
      propId: prop.propId,
      assetId: prop.assetId,
      path: prop.path,
      x: prop.x,
      y: prop.y,
      scale: prop.scale,
      opacity: prop.opacity,
      zIndex: prop.zIndex,
      rotation: prop.rotation,
      flipX: prop.flipX
    }))
  );
}
