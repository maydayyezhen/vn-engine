import { Container, Graphics, Text } from "pixi.js";
import type { ChoiceOption } from "@vn-engine/vn-schema";
import type { VNRenderSize } from "../types";

/** 选项按钮渲染层。 */
export class ChoiceLayer {
  /** PixiJS 容器。 */
  readonly container = new Container();

  /** 创建选项层。 */
  constructor(
    /** 玩家点击选项时触发的回调。 */
    private readonly onChoose?: (optionId: string) => void
  ) {}

  /** 渲染当前选项按钮。 */
  render(choices: ChoiceOption[], size: VNRenderSize): void {
    this.container.removeChildren().forEach((child) => child.destroy({ children: true }));
    this.container.visible = choices.length > 0;
    if (!choices.length) return;

    const buttonWidth = 520;
    const buttonHeight = 58;
    const gap = 14;
    const startY = size.height * 0.46;
    const startX = (size.width - buttonWidth) / 2;

    choices.forEach((choice, index) => {
      const button = new Container();
      button.eventMode = "static";
      button.cursor = "pointer";
      button.position.set(startX, startY + index * (buttonHeight + gap));
      button.on("pointertap", () => this.onChoose?.(choice.id));

      const background = new Graphics();
      background.roundRect(0, 0, buttonWidth, buttonHeight, 12);
      background.fill({ color: 0xf7f3e8, alpha: 0.95 });
      background.stroke({ color: 0x2c4056, alpha: 0.5, width: 2 });
      button.addChild(background);

      const label = new Text({
        text: choice.text,
        style: {
          fill: 0x172033,
          fontFamily: "Arial, Microsoft YaHei, sans-serif",
          fontSize: 22,
          fontWeight: "700",
          wordWrap: true,
          wordWrapWidth: buttonWidth - 40
        }
      });
      label.anchor.set(0, 0.5);
      label.position.set(20, buttonHeight / 2);
      button.addChild(label);

      this.container.addChild(button);
    });
  }
}
