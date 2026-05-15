import { Application, Container } from "pixi.js";
import type { RuntimeSnapshot } from "@vn-engine/vn-core";
import type { VNProject } from "@vn-engine/vn-schema";
import { PixiAssetLoader } from "./assets/PixiAssetLoader";
import { BackgroundLayer } from "./layers/BackgroundLayer";
import { CharacterLayer } from "./layers/CharacterLayer";
import { ChoiceLayer } from "./layers/ChoiceLayer";
import { DialogueLayer } from "./layers/DialogueLayer";
import type { PixiVNRendererOptions, PixiVNRenderOptions, VNRenderSize } from "./types";
import { ActionPlayer } from "./actions/ActionPlayer";
import { normalizeCameraState } from "./utils/presentationLayout";
import { resolveRenderResources } from "./utils/resolveRenderResources";

/** PixiJS 视觉小说最小渲染器。 */
export class PixiVNRenderer {
  /** PixiJS Application 实例。 */
  private app: Application | null = null;
  /** 当前舞台尺寸。 */
  private size: VNRenderSize;
  /** 根容器。 */
  private readonly root = new Container();
  /** 场景容器，镜头效果只作用于背景和角色。 */
  private readonly sceneRoot = new Container();
  /** UI 容器，不受镜头效果影响。 */
  private readonly uiRoot = new Container();
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
  /** 镜头动画编号，用于让旧震动动画失效。 */
  private cameraAnimationToken = 0;
  /** 动作序列播放协调器。 */
  private readonly actionPlayer = new ActionPlayer();
  /** 当前正在播放的动作序列 key，用于避免同一快照重复启动。 */
  private activeActionSequenceKey: string | null = null;
  /** 已完成但 runtime 尚未推进前的动作序列 key，用于避免重复完成回调。 */
  private completedActionSequenceKey: string | null = null;

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
    this.root.addChild(this.sceneRoot);
    this.root.addChild(this.uiRoot);
    this.backgroundLayer = new BackgroundLayer(this.assetLoader, app.renderer);
    this.characterLayer = new CharacterLayer(this.assetLoader, app.renderer);
    this.dialogueLayer = new DialogueLayer();
    this.choiceLayer = new ChoiceLayer(this.options.onChoose);

    this.sceneRoot.addChild(this.backgroundLayer.container);
    this.sceneRoot.addChild(this.characterLayer.container);
    this.uiRoot.addChild(this.dialogueLayer.container);
    this.uiRoot.addChild(this.choiceLayer.container);

    app.canvas.className = "pixi-vn-canvas";
    container.innerHTML = "";
    container.appendChild(app.canvas);
  }

  /** 根据运行时快照和工程数据渲染画面。 */
  async render(snapshot: RuntimeSnapshot, project: VNProject, renderOptions: PixiVNRenderOptions = {}): Promise<void> {
    if (!this.app || !this.backgroundLayer || !this.characterLayer || !this.dialogueLayer || !this.choiceLayer) return;
    const resources = resolveRenderResources(project, snapshot);

    await this.backgroundLayer.render(resources.background, this.size);
    await this.characterLayer.render(resources.characters, this.size);
    this.applyCamera(resources.camera);
    this.dialogueLayer.container.visible = !renderOptions.hideRuntimeUi;
    this.choiceLayer.container.visible = !renderOptions.hideRuntimeUi;
    if (!renderOptions.hideRuntimeUi) {
      this.dialogueLayer.render(snapshot, project, this.size);
      this.choiceLayer.render(snapshot.type === "choices" ? snapshot.choices : [], this.size);
    }
    this.playPendingActions(snapshot);
  }

  /** 根据 pendingActions 播放动作序列，并保证同一快照只触发一次完成回调。 */
  private playPendingActions(snapshot: RuntimeSnapshot): void {
    if (!snapshot.pendingActions?.length) {
      if (this.activeActionSequenceKey) this.actionPlayer.stop();
      this.activeActionSequenceKey = null;
      this.completedActionSequenceKey = null;
      return;
    }

    const key = this.createActionSequenceKey(snapshot);
    if (key === this.activeActionSequenceKey || key === this.completedActionSequenceKey) return;

    this.completedActionSequenceKey = null;
    this.activeActionSequenceKey = key;
    void this.actionPlayer.play(snapshot.pendingActions).then(() => {
      if (this.activeActionSequenceKey !== key) return;
      this.activeActionSequenceKey = null;
      this.completedActionSequenceKey = key;
      this.options.onActionSequenceComplete?.();
    });
  }

  /** 创建稳定动作序列 key。 */
  private createActionSequenceKey(snapshot: RuntimeSnapshot): string {
    const actionsKey = snapshot.pendingActions
      .map((action) => `${action.parallelGroupId ?? ""}:${action.actionId}:${action.actionType}:${action.durationMs}`)
      .join("|");
    return `${snapshot.currentScriptId}:${snapshot.currentNodeId ?? ""}:${actionsKey}`;
  }

  /** 调整舞台尺寸。 */
  resize(width: number, height: number): void {
    if (!this.app) return;
    this.size = { width, height };
    this.app.renderer.resize(width, height);
  }

  /** 销毁渲染器并释放画布。 */
  /** 应用基础镜头状态。 */
  private applyCamera(camera: RuntimeSnapshot["camera"]): void {
    const normalized = normalizeCameraState(camera);
    const shakeOffset = normalized.shake ? Math.sin(performance.now() / 24) * normalized.shakeIntensity : 0;
    this.sceneRoot.pivot.set(this.size.width / 2, this.size.height / 2);
    this.sceneRoot.position.set(this.size.width / 2 + normalized.offsetX + shakeOffset, this.size.height / 2 + normalized.offsetY);
    this.sceneRoot.scale.set(normalized.zoom);
  }

  destroy(): void {
    this.actionPlayer.destroy();
    this.activeActionSequenceKey = null;
    this.completedActionSequenceKey = null;
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
