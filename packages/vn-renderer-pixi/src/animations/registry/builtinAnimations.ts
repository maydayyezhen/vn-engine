import type { AnimationModule } from "../types/AnimationModule";
import { characterBreathe } from "../builtin/character.breathe";
import { characterNervousShake } from "../builtin/character.nervousShake";
import { characterSoftEnter } from "../builtin/character.softEnter";
import { cameraShakeLight } from "../builtin/camera.shakeLight";
import { cameraSoftZoom } from "../builtin/camera.softZoom";
import { particleSnow } from "../builtin/particle.snow";
import { screenFadeToBlack } from "../builtin/screen.fadeToBlack";
import { screenFlashWhite } from "../builtin/screen.flashWhite";

/** 内置动画模块列表。 */
export const builtinAnimations: AnimationModule[] = [
  characterSoftEnter,
  characterNervousShake,
  characterBreathe,
  cameraSoftZoom,
  cameraShakeLight,
  screenFlashWhite,
  screenFadeToBlack,
  particleSnow
];
