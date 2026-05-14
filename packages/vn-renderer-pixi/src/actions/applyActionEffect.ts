import type { RuntimeActionEffect } from "@vn-engine/vn-core";

/** 返回动作调试摘要，避免渲染层直接解释剧情节点。 */
export function summarizeActionEffect(action: RuntimeActionEffect): string {
  return `${action.actionType}:${action.actionId}`;
}
