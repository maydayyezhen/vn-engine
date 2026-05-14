import type { ChoiceOption, ConditionBranch, NodeTarget, ScriptFile, StoryNode, VNProject } from "@vn-engine/vn-schema";
import { validateProject } from "@vn-engine/vn-schema";

/** 节点补丁类型，用于表单向服务传递局部修改。 */
export type StoryNodePatch = object;

/** 生成稳定且低冲突的新节点 id。 */
function createNodeId(prefix = "node"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** 深拷贝 JSON 兼容数据。 */
function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** 查找脚本下标。 */
function findScriptIndex(project: VNProject, scriptId: string): number {
  return project.scripts.findIndex((script) => script.id === scriptId);
}

/** 查找节点下标。 */
function findNodeIndex(script: ScriptFile, nodeId: string): number {
  return script.nodes.findIndex((node) => node.id === nodeId);
}

/** 更新指定脚本，返回新的工程对象。 */
function updateScript(project: VNProject, scriptId: string, updater: (script: ScriptFile) => ScriptFile): VNProject {
  const scriptIndex = findScriptIndex(project, scriptId);
  if (scriptIndex < 0) return project;

  const scripts = project.scripts.map((script, index) => (index === scriptIndex ? updater(script) : script));
  return { ...project, scripts };
}

/** 获取节点摘要，供节点列表展示。 */
export function getNodeSummary(node: StoryNode): string {
  if (node.type === "dialogue") return node.text;
  if (node.type === "narration") return node.text;
  if (node.type === "choice") return node.prompt ?? node.options.map((option) => option.text).join(" / ");
  if (node.type === "scene") return node.backgroundAssetId;
  if (node.type === "showCharacter") return `${node.characterId} ${node.expression ?? ""} ${node.position ?? ""}`.trim();
  if (node.type === "hideCharacter") return node.characterId;
  if (node.type === "camera") return `zoom ${node.zoom ?? 1} offset ${node.offsetX ?? 0},${node.offsetY ?? 0}`;
  if (node.type === "actionSequence") return `${node.name ?? "动作序列"} / ${node.actions.length} actions`;
  if (node.type === "label") return `#${node.name}`;
  if (node.type === "jump") return `${node.target.scriptId}:${node.target.label ? `#${node.target.label}` : node.target.nodeId ?? ""}`;
  if (node.type === "setVariable") return `${node.variableName ?? node.name ?? ""} ${node.operator ?? "set"} ${String(node.value)}`;
  if (node.type === "condition") return node.condition?.kind ?? node.branches?.[0]?.variable ?? "条件分支";
  if (node.type === "playAudio") return `${node.channel}:${node.assetId}`;
  if (node.type === "stopAudio") return node.channel;
  return "";
}

/** 获取脚本中的节点列表。 */
export function listStoryNodes(script: ScriptFile | undefined): StoryNode[] {
  return script?.nodes ?? [];
}

/** 根据节点 id 查找节点。 */
export function findStoryNode(script: ScriptFile | undefined, nodeId: string | null): StoryNode | null {
  if (!script || !nodeId) return null;
  return script.nodes.find((node) => node.id === nodeId) ?? null;
}

/** 更新指定节点，返回新的工程对象。 */
export function updateNode(project: VNProject, scriptId: string, nodeId: string, patch: StoryNodePatch): VNProject {
  return updateScript(project, scriptId, (script) => ({
    ...script,
    nodes: script.nodes.map((node) => (node.id === nodeId ? ({ ...node, ...patch } as StoryNode) : node))
  }));
}

/** 在当前节点后新增对话节点。 */
export function addDialogueNodeAfter(project: VNProject, scriptId: string, afterNodeId: string | null): VNProject {
  const node: StoryNode = {
    id: createNodeId("dialogue"),
    type: "dialogue",
    characterId: project.characters[0]?.id ?? "",
    text: "新的对话"
  };
  return insertNodeAfter(project, scriptId, afterNodeId, node);
}

/** 在当前节点后新增旁白节点。 */
export function addNarrationNodeAfter(project: VNProject, scriptId: string, afterNodeId: string | null): VNProject {
  const node: StoryNode = {
    id: createNodeId("narration"),
    type: "narration",
    text: "新的旁白"
  };
  return insertNodeAfter(project, scriptId, afterNodeId, node);
}

/** 在当前节点后新增镜头节点。 */
export function addCameraNodeAfter(project: VNProject, scriptId: string, afterNodeId: string | null): VNProject {
  const node: StoryNode = {
    id: createNodeId("camera"),
    type: "camera",
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    shake: false,
    shakeIntensity: 0,
    durationMs: 300
  };
  return insertNodeAfter(project, scriptId, afterNodeId, node);
}

/** 在当前节点后新增动作序列节点。 */
export function addActionSequenceNodeAfter(project: VNProject, scriptId: string, afterNodeId: string | null): VNProject {
  const node: StoryNode = {
    id: createNodeId("actionSequence"),
    type: "actionSequence",
    name: "新的动作序列",
    actions: [],
    autoNext: true,
    waitForCompletion: true
  };
  return insertNodeAfter(project, scriptId, afterNodeId, node);
}

/** 在当前节点后新增标签节点。 */
export function addLabelNodeAfter(project: VNProject, scriptId: string, afterNodeId: string | null): VNProject {
  const node: StoryNode = {
    id: createNodeId("label"),
    type: "label",
    name: `label_${Date.now().toString(36)}`,
    description: ""
  };
  return insertNodeAfter(project, scriptId, afterNodeId, node);
}

/** 在指定节点后插入节点，找不到节点时插入到脚本末尾。 */
export function insertNodeAfter(project: VNProject, scriptId: string, afterNodeId: string | null, node: StoryNode): VNProject {
  return updateScript(project, scriptId, (script) => {
    const insertIndex = afterNodeId ? findNodeIndex(script, afterNodeId) + 1 : script.nodes.length;
    const safeIndex = insertIndex > 0 ? insertIndex : script.nodes.length;
    const nodes = [...script.nodes.slice(0, safeIndex), node, ...script.nodes.slice(safeIndex)];
    return { ...script, nodes };
  });
}

/** 复制指定节点并插入到原节点之后。 */
export function duplicateNode(project: VNProject, scriptId: string, nodeId: string): VNProject {
  const script = project.scripts.find((item) => item.id === scriptId);
  const node = script?.nodes.find((item) => item.id === nodeId);
  if (!node) return project;

  const duplicated = {
    ...cloneJson(node),
    id: createNodeId(node.type)
  } as StoryNode;

  return insertNodeAfter(project, scriptId, nodeId, duplicated);
}

/** 删除指定节点；如果脚本被删空，自动补一个旁白占位节点。 */
export function deleteNode(project: VNProject, scriptId: string, nodeId: string): VNProject {
  return updateScript(project, scriptId, (script) => {
    const remainingNodes = script.nodes.filter((node) => node.id !== nodeId);
    const nodes =
      remainingNodes.length > 0
        ? remainingNodes
        : [
            {
              id: createNodeId("narration"),
              type: "narration",
              text: "空脚本占位旁白"
            } satisfies StoryNode
          ];

    return { ...script, nodes };
  });
}

/** 删除节点后选择一个安全节点 id。 */
export function selectSafeNodeAfterDelete(project: VNProject, scriptId: string, deletedNodeId: string): string | null {
  const script = project.scripts.find((item) => item.id === scriptId);
  if (!script) return null;
  const deletedIndex = findNodeIndex(script, deletedNodeId);
  const fallbackIndex = deletedIndex >= 0 ? Math.min(deletedIndex, script.nodes.length - 1) : 0;
  return script.nodes[fallbackIndex]?.id ?? null;
}

/** 校验当前工程。 */
export function validateCurrentProject(project: VNProject) {
  return validateProject(project);
}

/** 更新选项节点中的某个选项。 */
export function updateChoiceOption(node: Extract<StoryNode, { type: "choice" }>, optionId: string, patch: Partial<ChoiceOption>) {
  return {
    ...node,
    options: node.options.map((option) => (option.id === optionId ? { ...option, ...patch } : option))
  };
}

/** 更新条件节点的第一个 true 分支和 fallback 分支。 */
export function updateConditionNode(
  node: Extract<StoryNode, { type: "condition" }>,
  patch: {
    /** 变量名。 */
    variable?: string;
    /** 运算符。 */
    operator?: ConditionBranch["operator"];
    /** 比较值。 */
    value?: ConditionBranch["value"];
    /** true 分支目标。 */
    trueTarget?: NodeTarget;
    /** false 分支目标。 */
    falseTarget?: NodeTarget;
  }
): StoryNode {
  const firstBranch = node.branches?.[0] ?? {
    id: "branch_true",
    variable: "flag",
    operator: "equals",
    value: true,
    target: patch.trueTarget ?? { scriptId: "", nodeId: "" }
  };

  return {
    ...node,
    branches: [
      {
        ...firstBranch,
        variable: patch.variable ?? firstBranch.variable,
        operator: patch.operator ?? firstBranch.operator,
        value: patch.value ?? firstBranch.value,
        target: patch.trueTarget ?? firstBranch.target
      },
      ...(node.branches ?? []).slice(1)
    ],
    fallbackTarget: patch.falseTarget ?? node.fallbackTarget
  };
}
