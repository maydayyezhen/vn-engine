import type { VNAction, VNActionType, VNProject } from "@vn-engine/vn-schema";
import { createDefaultAction, duplicateAction } from "./actionFactoryService";
import { updateNode } from "./scriptEditService";

/** 更新动作序列节点中的动作列表。 */
export function updateActionSequenceActions(project: VNProject, scriptId: string, nodeId: string, actions: VNAction[]): VNProject {
  return updateNode(project, scriptId, nodeId, { actions });
}

/** 新增动作到动作列表末尾。 */
export function addAction(actions: VNAction[], type: VNActionType, project: VNProject): VNAction[] {
  return [...actions, createDefaultAction(type, project)];
}

/** 更新指定动作。 */
export function updateAction(actions: VNAction[], actionId: string, patch: Partial<VNAction>): VNAction[] {
  return actions.map((action) => {
    if (action.id === actionId) return { ...action, ...patch } as VNAction;
    if (action.type === "parallel") return { ...action, actions: updateAction(action.actions, actionId, patch) };
    return action;
  });
}

/** 删除指定动作。 */
export function deleteAction(actions: VNAction[], actionId: string): VNAction[] {
  return actions
    .filter((action) => action.id !== actionId)
    .map((action) => (action.type === "parallel" ? { ...action, actions: deleteAction(action.actions, actionId) } : action));
}

/** 复制指定动作并插入到原动作之后。 */
export function copyAction(actions: VNAction[], actionId: string): VNAction[] {
  const result: VNAction[] = [];
  for (const action of actions) {
    if (action.type === "parallel") {
      const nextAction = { ...action, actions: copyAction(action.actions, actionId) };
      result.push(nextAction);
    } else {
      result.push(action);
    }
    if (action.id === actionId) result.push(duplicateAction(action));
  }
  return result;
}

/** 移动动作。 */
export function moveAction(actions: VNAction[], actionId: string, direction: -1 | 1): VNAction[] {
  const index = actions.findIndex((action) => action.id === actionId);
  if (index >= 0) {
    const target = index + direction;
    if (target < 0 || target >= actions.length) return actions;
    const next = [...actions];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    return next;
  }
  return actions.map((action) => (action.type === "parallel" ? { ...action, actions: moveAction(action.actions, actionId, direction) } : action));
}

/** 在 parallel 动作中新增子动作。 */
export function addParallelChildAction(actions: VNAction[], parallelActionId: string, type: VNActionType, project: VNProject): VNAction[] {
  return actions.map((action) => {
    if (action.id === parallelActionId && action.type === "parallel") {
      return { ...action, actions: [...action.actions, createDefaultAction(type, project)] };
    }
    if (action.type === "parallel") return { ...action, actions: addParallelChildAction(action.actions, parallelActionId, type, project) };
    return action;
  });
}
