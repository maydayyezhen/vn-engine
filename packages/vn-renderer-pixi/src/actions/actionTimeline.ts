import type { RuntimeActionEffect } from "@vn-engine/vn-core";
import { normalizeActionEasing } from "./actionEasing";

/** 展开后的动作时间片。 */
export interface ActionTimelineStep {
  /** 要同时等待的动作列表。 */
  actions: RuntimeActionEffect[];
  /** 该时间片持续时间。 */
  durationMs: number;
}

/** 规范化单个动作效果，补齐时长和缓动默认值。 */
export function normalizeActionEffect(action: RuntimeActionEffect): RuntimeActionEffect {
  return {
    ...action,
    durationMs: Math.max(0, action.durationMs ?? (action.actionType === "wait" ? 500 : 300)),
    easing: normalizeActionEasing(action.easing)
  };
}

/** 将 pendingActions 展开成顺序时间片，同一 parallelGroupId 的动作视为并行。 */
export function buildActionTimeline(actions: RuntimeActionEffect[]): ActionTimelineStep[] {
  const steps: ActionTimelineStep[] = [];
  let index = 0;
  while (index < actions.length) {
    const current = normalizeActionEffect(actions[index]);
    if (current.parallelGroupId) {
      const groupId = current.parallelGroupId;
      const group: RuntimeActionEffect[] = [];
      while (index < actions.length && actions[index].parallelGroupId === groupId) {
        group.push(normalizeActionEffect(actions[index]));
        index += 1;
      }
      steps.push({
        actions: group,
        durationMs: Math.max(0, ...group.map((action) => action.durationMs))
      });
      continue;
    }
    steps.push({ actions: [current], durationMs: current.durationMs });
    index += 1;
  }
  return steps;
}

/** 计算动作序列总等待时长。 */
export function getActionTimelineDuration(actions: RuntimeActionEffect[]): number {
  return buildActionTimeline(actions).reduce((total, step) => total + step.durationMs, 0);
}
