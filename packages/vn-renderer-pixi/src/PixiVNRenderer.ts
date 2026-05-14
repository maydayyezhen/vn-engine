import { Application, Container } from "pixi.js";
import type { RuntimeSnapshot } from "@vn-engine/vn-core";
import type { VNProject } from "@vn-engine/vn-schema";
import { PixiAssetLoader } from "./assets/PixiAssetLoader";
import { BackgroundLayer } from "./layers/BackgroundLayer";
import { CharacterLayer } from "./layers/CharacterLayer";
import { ChoiceLayer } from "./layers/ChoiceLayer";
import { DialogueLayer } from "./layers/DialogueLayer";
import type { PixiVNRendererOptions, VNRenderSize } from "./types";
import { resolveRenderResources } from "./utils/resolveRenderResources";

/** PixiJS 视觉小说最小渲染器。 */
export class PixiVNRenderer {
  /** PixiJS Application 实例。 */
  private app: Application | null = null;
  /** 当前舞台尺寸。 */
  private size: VNRenderSize;
  /** 根容器。 */
  private readonly root = new Container();
  /** 资源加载器。 */
  private readonly assetLoader = new PixiAssetLoader();
  /** 背景层。 */
  private backgroundLayer: BackgroundLayer | null = null;
  /** 角色层。 */
  private characterLayer: CharacterLayer | null = null;
  /** 对话层。 */
  private dialogueLayer: DialogueLayer | null = null;
  /** 选项层。 */
  private choiceLayer: ChoiceLayer | null = null;

  /** 创建 PixiJS 视觉小说渲染器。 */
  constructor(private readonly options: PixiVNRendererOptions = {}) {
    this.size = {
      width: options.width ?? 1280,
      height: options.height ?? 720
    };
  }

  /** 挂载 PixiJS 画布。 */
  async mount(container: HTMLElement): Promise<void> {
    if (this.app) return;
    const app = new Application();
    await app.init({
      width: this.size.width,
      height: this.size.height,
      antialias: true,
      backgroundAlpha: 0,
      resolution: globalThis.devicePixelRatio || 1,
      autoDensity: true
    });

    this.app = app;
    app.stage.addChild(this.root);
    this.backgroundLayer = new BackgroundLayer(this.assetLoader, app.renderer);
    this.characterLayer = new CharacterLayer(this.assetLoader, app.renderer);
    this.dialogueLayer = new DialogueLayer();
    this.choiceLayer = new ChoiceLayer(this.options.onChoose);

    this.root.addChild(this.backgroundLayer.container);
    this.root.addChild(this.characterLayer.container);
    this.root.addChild(this.dialogueLayer.container);
    this.root.addChild(this.choiceLayer.container);

    app.canvas.className = "pixi-vn-canvas";
    container.innerHTML = "";
    container.appendChild(app.canvas);
  }

  /** 根据运行时快照和工程数据渲染画面。 */
  async render(snapshot: RuntimeSnapshot, project: VNProject): Promise<void> {
    if (!this.app || !this.backgroundLayer || !this.characterLayer || !this.dialogueLayer || !this.choiceLayer) return;
    const resources = resolveRenderResources(project, snapshot);

    await this.backgroundLayer.render(resources.background, this.size);
    await this.characterLayer.render(resources.characters, this.size);
    this.dialogueLayer.render(snapshot, project, this.size);
    this.choiceLayer.render(snapshot.type === "choices" ? snapshot.choices : [], this.size);
  }

  /** 调整舞台尺寸。 */
  resize(width: number, height: number): void {
    if (!this.app) return;
    this.size = { width, height };
    this.app.renderer.resize(width, height);
  }

  /** 销毁渲染器并释放画布。 */
  destroy(): void {
    this.assetLoader.clear();
    this.root.removeChildren();
    this.app?.destroy(true, { children: true, texture: false });
    this.app = null;
    this.backgroundLayer = null;
    this.characterLayer = null;
    this.dialogueLayer = null;
    this.choiceLayer = null;
  }
}
