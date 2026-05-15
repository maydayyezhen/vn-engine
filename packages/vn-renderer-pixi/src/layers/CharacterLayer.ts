import { Container, Renderer, Sprite } from "pixi.js";
import { PixiAssetLoader } from "../assets/PixiAssetLoader";
import type { ResolvedCharacterResource, VNRenderSize } from "../types";
import { createPlaceholderTexture } from "../utils/createPlaceholderTexture";
import { resolveCharacterLayout, sortCharactersByZIndex } from "../utils/presentationLayout";

/** 角色立绘渲染层。 */
export class CharacterLayer {
  /** PixiJS 容器。 */
  readonly container = new Container();

  /** 当前动画编号，用于让旧动画失效。 */
  private animationToken = 0;
  /** 当前静态角色渲染键，用于避免普通对话刷新时重建立绘。 */
  private currentRenderKey = "";
  /** 已消费的一次性角色演出效果 id。 */
  private readonly consumedEffectIds = new Set<string>();
  /** 当前角色 id 到 Pixi 显示对象的映射，供动画模块定位目标。 */
  private readonly spritesByCharacterId = new Map<string, Sprite>();

  /** 创建角色层。 */
  constructor(
    /** 资源加载器。 */
    private readonly loader: PixiAssetLoader,
    /** PixiJS 渲染器。 */
    private readonly renderer: Renderer
  ) {}

  /** 根据当前角色显示状态渲染角色。 */
  async render(characters: ResolvedCharacterResource[], size: VNRenderSize): Promise<void> {
    const sortedCharacters = sortCharactersByZIndex(characters);
    const renderKey = createCharacterLayerRenderKey(sortedCharacters, size);
    const hasFreshEffect = sortedCharacters.some((character) => Boolean(character.effectId && !this.consumedEffectIds.has(character.effectId)));
    if (this.currentRenderKey === renderKey && !hasFreshEffect) return;

    this.animationToken += 1;
    const token = this.animationToken;
    const nextEntries: Array<{ characterId: string; sprite: Sprite }> = [];

    for (const character of sortedCharacters) {
      const alreadyConsumed = Boolean(character.effectId && this.consumedEffectIds.has(character.effectId));
      if (alreadyConsumed && character.exitEffect) continue;
      if (character.exitEffect === "none" || (character.exitEffect && (character.transitionDurationMs ?? 300) <= 0)) continue;
      const texture = await this.loader.loadTexture(character.path);
      const sprite = texture
        ? new Sprite(texture)
        : new Sprite(createPlaceholderTexture(this.renderer, `${character.characterName}\n${character.expressionName}\n${character.assetId ?? "无素材"}`, 260, 420, 0x5a6f86));

      sprite.anchor.set(0.5, 1);
      const layout = resolveCharacterLayout(character, size);
      const fitScale = this.resolveFitScale(sprite, size);
      sprite.scale.set(fitScale * layout.scale * layout.scaleXSign, fitScale * layout.scale);
      sprite.position.set(layout.x, layout.y);
      sprite.alpha = layout.opacity;
      sprite.zIndex = layout.zIndex;
      this.applyEntrance(sprite, character, size, token, alreadyConsumed);
      nextEntries.push({ characterId: character.characterId, sprite });
    }

    const oldSprites = new Map(this.spritesByCharacterId);
    this.container.removeChildren();
    this.spritesByCharacterId.clear();

    for (const { characterId, sprite } of nextEntries) {
      this.container.addChild(sprite);
      this.spritesByCharacterId.set(characterId, sprite);
    }

    for (const sprite of oldSprites.values()) {
      sprite.destroy({ children: true });
    }

    this.currentRenderKey = renderKey;
    this.container.sortableChildren = true;
    this.container.sortChildren();
  }

  /** 计算立绘基础适配缩放。 */
  /** 获取当前角色显示对象，动画模块只通过该受限入口操作角色。 */
  getCharacterSprite(characterId: string): Sprite | undefined {
    return this.spritesByCharacterId.get(characterId);
  }

  /** 计算立绘基础适配缩放。 */
  private resolveFitScale(sprite: Sprite, size: VNRenderSize): number {
    const maxHeight = size.height * 0.66;
    const maxWidth = size.width * 0.28;
    const scale = Math.min(maxWidth / sprite.texture.width, maxHeight / sprite.texture.height, 1.6);
    return Number.isFinite(scale) && scale > 0 ? scale : 1;
  }

  /** 应用基础入场或退场效果。 */
  private applyEntrance(sprite: Sprite, character: ResolvedCharacterResource, size: VNRenderSize, token: number, alreadyConsumed: boolean): void {
    const layout = resolveCharacterLayout(character, size);
    if (alreadyConsumed) return;
    const effect = character.exitEffect ?? character.enterEffect;
    if (layout.durationMs <= 0 || effect === "none") return;
    if (character.effectId) this.consumedEffectIds.add(character.effectId);

    const targetX = sprite.x;
    const targetAlpha = sprite.alpha;
    if (effect === "fadeIn") sprite.alpha = 0;
    if (effect === "slideInLeft") sprite.x = -size.width * 0.1;
    if (effect === "slideInRight") sprite.x = size.width * 1.1;
    const startX = sprite.x;

    this.animate(layout.durationMs, token, (progress) => {
      if (effect === "fadeIn") sprite.alpha = targetAlpha * progress;
      if (effect === "slideInLeft" || effect === "slideInRight") sprite.x = startX + (targetX - startX) * progress;
      if (effect === "fadeOut") sprite.alpha = targetAlpha * (1 - progress);
      if (effect === "slideOutLeft") sprite.x = targetX - size.width * progress;
      if (effect === "slideOutRight") sprite.x = targetX + size.width * progress;
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

/** 创建角色层静态渲染键，不包含一次性入场/退场效果。 */
export function createCharacterLayerRenderKey(characters: ResolvedCharacterResource[], size: VNRenderSize): string {
  return JSON.stringify({
    width: size.width,
    height: size.height,
    characters: characters.map((character) => ({
      characterId: character.characterId,
      expressionId: character.expressionId,
      assetId: character.assetId,
      path: character.path,
      position: character.position,
      x: character.x,
      y: character.y,
      scale: character.scale,
      opacity: character.opacity,
      zIndex: character.zIndex,
      flipX: character.flipX,
      exiting: Boolean(character.exitEffect)
    }))
  });
}
