import { Container, Graphics, Renderer, Sprite } from "pixi.js";
import { PixiAssetLoader } from "../assets/PixiAssetLoader";
import type { ResolvedBackgroundResource, VNRenderSize } from "../types";
import { createPlaceholderTexture } from "../utils/createPlaceholderTexture";
import { normalizeTransition } from "../utils/presentationLayout";

/** 背景渲染层。 */
export class BackgroundLayer {
  /** PixiJS 容器。 */
  readonly container = new Container();

  /** 当前动画编号，用于让旧动画失效。 */
  private animationToken = 0;

  /** 创建背景层。 */
  constructor(
    /** 资源加载器。 */
    private readonly loader: PixiAssetLoader,
    /** PixiJS 渲染器。 */
    private readonly renderer: Renderer
  ) {}

  /** 根据当前背景资源渲染背景。 */
  async render(resource: ResolvedBackgroundResource, size: VNRenderSize): Promise<void> {
    this.animationToken += 1;
    this.container.removeChildren().forEach((child) => child.destroy({ children: true }));
    const content = new Container();
    const texture = await this.loader.loadTexture(resource.path);

    if (texture) {
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.position.set(size.width / 2, size.height / 2);
      sprite.scale.set(Math.max(size.width / texture.width, size.height / texture.height));
      content.addChild(sprite);
    } else {
      const fallback = new Graphics();
      fallback.rect(0, 0, size.width, size.height);
      fallback.fill({ color: 0x26384d });
      content.addChild(fallback);

      const placeholder = new Sprite(createPlaceholderTexture(this.renderer, `背景\n${resource.name}`, 520, 180, 0x315f88));
      placeholder.anchor.set(0.5);
      placeholder.position.set(size.width / 2, size.height / 2);
      content.addChild(placeholder);
    }

    this.container.addChild(content);
    this.applyTransition(content, resource, size, this.animationToken);
  }

  /** 应用基础背景转场。 */
  private applyTransition(content: Container, resource: ResolvedBackgroundResource, size: VNRenderSize, token: number): void {
    const transition = normalizeTransition(resource.transition, resource.transitionDurationMs);
    if (transition.type === "none" || transition.durationMs <= 0) return;

    if (transition.type === "fade") content.alpha = 0;
    if (transition.type === "slideLeft") content.x = size.width;
    if (transition.type === "slideRight") content.x = -size.width;

    this.animate(transition.durationMs, token, (progress) => {
      if (transition.type === "fade") content.alpha = progress;
      if (transition.type === "slideLeft") content.x = size.width * (1 - progress);
      if (transition.type === "slideRight") content.x = -size.width * (1 - progress);
    });
  }

  /** 使用 requestAnimationFrame 执行轻量动画。 */
  private animate(durationMs: number, token: number, update: (progress: number) => void): void {
    const start = performance.now();
    const tick = (now: number) => {
      if (token !== this.animationToken) return;
      const progress = Math.min((now - start) / durationMs, 1);
      update(progress);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
