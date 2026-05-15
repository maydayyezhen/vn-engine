import type { RuntimeSnapshot } from "@vn-engine/vn-core";
import type { CharacterEnterEffect, CharacterExitEffect, CharacterPosition, TransitionType } from "@vn-engine/vn-schema";
import type { ResolvedCharacterResource, VNRenderSize } from "../types";

/** 标准化后的背景转场参数。 */
export interface NormalizedTransition {
  /** 背景转场类型。 */
  type: TransitionType;
  /** 背景转场时长，单位毫秒。 */
  durationMs: number;
}

/** 标准化后的镜头状态。 */
export interface NormalizedCameraState {
  /** 画面缩放倍率。 */
  zoom: number;
  /** 画面横向偏移。 */
  offsetX: number;
  /** 画面纵向偏移。 */
  offsetY: number;
  /** 是否震动。 */
  shake: boolean;
  /** 震动强度。 */
  shakeIntensity: number;
  /** 镜头效果时长，单位毫秒。 */
  durationMs: number;
}

/** 角色布局结果。 */
export interface CharacterLayout {
  /** 角色横坐标。 */
  x: number;
  /** 角色底部纵坐标。 */
  y: number;
  /** 缩放倍率。 */
  scale: number;
  /** 透明度。 */
  opacity: number;
  /** 层级。 */
  zIndex: number;
  /** 水平缩放方向。 */
  scaleXSign: 1 | -1;
  /** 登场效果。 */
  enterEffect?: CharacterEnterEffect;
  /** 退场效果。 */
  exitEffect?: CharacterExitEffect;
  /** 演出时长，单位毫秒。 */
  durationMs: number;
}

/** 解析背景转场参数。 */
export function normalizeTransition(type: TransitionType | undefined, durationMs: number | undefined): NormalizedTransition {
  return {
    type: type ?? "none",
    durationMs: Math.max(0, Math.min(durationMs ?? 300, 5000))
  };
}

/** 解析镜头状态。 */
export function normalizeCameraState(camera: RuntimeSnapshot["camera"] | undefined): NormalizedCameraState {
  return {
    zoom: camera?.zoom && camera.zoom > 0 ? camera.zoom : 1,
    offsetX: camera?.offsetX ?? 0,
    offsetY: camera?.offsetY ?? 0,
    shake: camera?.shake ?? false,
    shakeIntensity: Math.max(0, camera?.shakeIntensity ?? 0),
    durationMs: Math.max(0, Math.min(camera?.durationMs ?? 0, 5000))
  };
}

/** 计算角色位置横坐标。 */
export function resolveCharacterX(position: CharacterPosition, width: number, customX?: number): number {
  if (position === "left") return width * 0.28;
  if (position === "right") return width * 0.72;
  if (position === "custom") return customX ?? width * 0.5;
  return width * 0.5;
}

/** 计算角色位置纵坐标。 */
export function resolveCharacterY(position: CharacterPosition, height: number, customY?: number): number {
  if (position === "custom") return customY ?? height - 145;
  return height - 145;
}

/** 计算角色布局参数。 */
export function resolveCharacterLayout(character: ResolvedCharacterResource, size: VNRenderSize): CharacterLayout {
  return {
    x: resolveCharacterX(character.position, size.width, character.x),
    y: resolveCharacterY(character.position, size.height, character.y),
    scale: character.scale > 0 ? character.scale : 1,
    opacity: Math.max(0, Math.min(character.opacity, 1)),
    zIndex: character.zIndex,
    scaleXSign: character.flipX ? -1 : 1,
    enterEffect: character.enterEffect ?? "none",
    exitEffect: character.exitEffect,
    durationMs: Math.max(0, Math.min(character.transitionDurationMs ?? 300, 5000))
  };
}

/** 按层级排序角色。 */
export function sortCharactersByZIndex(characters: ResolvedCharacterResource[]): ResolvedCharacterResource[] {
  return [...characters].sort((left, right) => left.zIndex - right.zIndex);
}
