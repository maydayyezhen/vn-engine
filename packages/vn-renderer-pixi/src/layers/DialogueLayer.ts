import { Container, Graphics, Text } from "pixi.js";
import type { RuntimeSnapshot } from "@vn-engine/vn-core";
import type { VNProject } from "@vn-engine/vn-schema";
import type { VNRenderSize } from "../types";

/** 底部对话框渲染层。 */
export class DialogueLayer {
  /** PixiJS 容器。 */
  readonly container = new Container();

  /** 渲染当前对话或结束状态。 */
  render(snapshot: RuntimeSnapshot, project: VNProject, size: VNRenderSize): void {
    this.container.removeChildren().forEach((child) => child.destroy({ children: true }));

    const boxHeight = 160;
    const boxX = 56;
    const boxY = size.height - boxHeight - 30;
    const boxWidth = size.width - boxX * 2;

    const background = new Graphics();
    background.roundRect(boxX, boxY, boxWidth, boxHeight, 16);
    background.fill({ color: 0x101722, alpha: 0.82 });
    background.stroke({ color: 0xffffff, alpha: 0.28, width: 2 });
    this.container.addChild(background);

    const speaker = this.resolveSpeaker(snapshot, project);
    const speakerText = new Text({
      text: speaker,
      style: {
        fill: 0xf7d27a,
        fontFamily: "Arial, Microsoft YaHei, sans-serif",
        fontSize: 24,
        fontWeight: "700"
      }
    });
    speakerText.position.set(boxX + 26, boxY + 18);
    this.container.addChild(speakerText);

    const bodyText = new Text({
      text: snapshot.isEnded ? "剧情已结束" : snapshot.text,
      style: {
        fill: 0xffffff,
        fontFamily: "Arial, Microsoft YaHei, sans-serif",
        fontSize: 28,
        lineHeight: 38,
        wordWrap: true,
        wordWrapWidth: boxWidth - 52
      }
    });
    bodyText.position.set(boxX + 26, boxY + 62);
    this.container.addChild(bodyText);
  }

  /** 解析说话人显示名称。 */
  private resolveSpeaker(snapshot: RuntimeSnapshot, project: VNProject): string {
    if (snapshot.isEnded) return "结束";
    if (!snapshot.speaker) return "旁白";
    const character = project.characters.find((item) => item.id === snapshot.speaker);
    return character?.displayName || character?.name || snapshot.speaker;
  }
}
