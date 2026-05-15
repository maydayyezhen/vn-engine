import { Container, Graphics, Renderer, Text, Texture } from "pixi.js";

/** 创建用于缺失资源的占位纹理。 */
export function createPlaceholderTexture(renderer: Renderer, label: string, width: number, height: number, color = 0x2e4f6f): Texture {
  const root = new Container();
  const background = new Graphics();
  background.roundRect(0, 0, width, height, 14);
  background.fill({ color, alpha: 1 });
  background.stroke({ color: 0xffffff, alpha: 0.35, width: 2 });
  root.addChild(background);

  const text = new Text({
    text: label,
    style: {
      fill: 0xffffff,
      fontFamily: "Arial, Microsoft YaHei, sans-serif",
      fontSize: Math.max(18, Math.min(32, Math.floor(width / 10))),
      fontWeight: "700",
      align: "center",
      wordWrap: true,
      wordWrapWidth: width - 32
    }
  });
  text.anchor.set(0.5);
  text.position.set(width / 2, height / 2);
  root.addChild(text);

  const texture = renderer.generateTexture({ target: root });
  root.destroy({ children: true });
  return texture;
}
