import { Container, Graphics, Renderer, Sprite } from "pixi.js";
import { PixiAssetLoader } from "../assets/PixiAssetLoader";
import type { ResolvedBackgroundResource, VNRenderSize } from "../types";
import { createPlaceholderTexture } from "../utils/createPlaceholderTexture";

/** 背景渲染层。 */
export class BackgroundLayer {
  /** PixiJS 容器。 */
  readonly container = new Container();

  /** 创建背景层。 */
  constructor(
    /** 资源加载器。 */
    private readonly loader: PixiAssetLoader,
    /** PixiJS 渲染器。 */
    private readonly renderer: Renderer
  ) {}

  /** 根据当前背景资源渲染背景。 */
  async render(resource: ResolvedBackgroundResource, size: VNRenderSize): Promise<void> {
    this.container.removeChildren().forEach((child) => child.destroy({ children: true }));
    const texture = await this.loader.loadTexture(resource.path);

    if (texture) {
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.position.set(size.width / 2, size.height / 2);
      const scale = Math.max(size.width / texture.width, size.height / texture.height);
      sprite.scale.set(scale);
      this.container.addChild(sprite);
      return;
    }

    const fallback = new Graphics();
    fallback.rect(0, 0, size.width, size.height);
    fallback.fill({ color: 0x26384d });
    this.container.addChild(fallback);

    const placeholder = new Sprite(createPlaceholderTexture(this.renderer, `背景\n${resource.name}`, 520, 180, 0x315f88));
    placeholder.anchor.set(0.5);
    placeholder.position.set(size.width / 2, size.height / 2);
    this.container.addChild(placeholder);
  }
}
