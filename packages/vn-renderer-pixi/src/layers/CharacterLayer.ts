import { Container, Renderer, Sprite } from "pixi.js";
import { PixiAssetLoader } from "../assets/PixiAssetLoader";
import type { ResolvedCharacterResource, VNRenderSize } from "../types";
import { createPlaceholderTexture } from "../utils/createPlaceholderTexture";

/** 角色立绘渲染层。 */
export class CharacterLayer {
  /** PixiJS 容器。 */
  readonly container = new Container();

  /** 创建角色层。 */
  constructor(
    /** 资源加载器。 */
    private readonly loader: PixiAssetLoader,
    /** PixiJS 渲染器。 */
    private readonly renderer: Renderer
  ) {}

  /** 根据当前角色显示状态渲染角色。 */
  async render(characters: ResolvedCharacterResource[], size: VNRenderSize): Promise<void> {
    this.container.removeChildren().forEach((child) => child.destroy({ children: true }));

    for (const character of characters) {
      const texture = await this.loader.loadTexture(character.path);
      const sprite = texture
        ? new Sprite(texture)
        : new Sprite(
            createPlaceholderTexture(
              this.renderer,
              `${character.characterName}\n${character.expressionName}\n${character.assetId ?? "无素材"}`,
              260,
              420,
              0x5a6f86
            )
          );

      sprite.anchor.set(0.5, 1);
      const maxHeight = size.height * 0.66;
      const maxWidth = size.width * 0.28;
      const scale = Math.min(maxWidth / sprite.texture.width, maxHeight / sprite.texture.height, 1.6);
      sprite.scale.set(Number.isFinite(scale) && scale > 0 ? scale : 1);
      sprite.position.set(this.resolveX(character.position, size.width), size.height - 145);
      this.container.addChild(sprite);
    }
  }

  /** 根据角色位置解析横坐标。 */
  private resolveX(position: ResolvedCharacterResource["position"], width: number): number {
    if (position === "left") return width * 0.28;
    if (position === "right") return width * 0.72;
    return width * 0.5;
  }
}
