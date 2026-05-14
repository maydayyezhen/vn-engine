import type { ChoiceOption, NodeTarget, StoryNode, VNProject } from "@vn-engine/vn-schema";
import { validateProject } from "@vn-engine/vn-schema";
import { ConditionEvaluator } from "../condition/ConditionEvaluator";
import { findNodeByIndex, findNodeIndex, findScript } from "../utils/runtimeLookup";
import { VariableStore } from "../variable/VariableStore";
import type { RuntimeState } from "./RuntimeState";
import type { RuntimeSnapshot } from "./RuntimeSnapshot";

/** 最小视觉小说运行时解释器。 */
export class VNRuntime {
  /** 当前工程数据。 */
  private readonly project: VNProject;
  /** 变量存储。 */
  private readonly variables: VariableStore;
  /** 条件求值器。 */
  private readonly conditionEvaluator: ConditionEvaluator;
  /** 当前运行状态。 */
  private state: RuntimeState;
  /** 当前快照。 */
  private snapshot: RuntimeSnapshot;

  /** 创建运行时实例。 */
  constructor(project: VNProject) {
    const validation = validateProject(project);
    if (!validation.valid) {
      throw new Error(`工程校验失败：${validation.errors.join("; ")}`);
    }

    this.project = project;
    this.variables = new VariableStore();
    this.conditionEvaluator = new ConditionEvaluator(this.variables);
    this.state = this.createInitialState(project.startScriptId);
    this.snapshot = this.createSnapshot("dialogue", null, "", []);
  }

  /** 从起始脚本的第一个节点开始运行。 */
  start(): RuntimeSnapshot {
    this.state = this.createInitialState(this.project.startScriptId);
    this.variables.load({});
    return this.processCurrentNode();
  }

  /** 推进到下一个剧情节点。 */
  next(): RuntimeSnapshot {
    if (this.state.isEnded || this.state.isWaitingChoice) return this.getSnapshot();
    this.state.currentNodeIndex += 1;
    return this.processCurrentNode();
  }

  /** 选择当前选项节点中的某个选项。 */
  choose(optionId: string): RuntimeSnapshot {
    const current = this.getCurrentNode();
    if (!current || current.type !== "choice") {
      throw new Error("当前节点不是选项节点，无法选择。");
    }

    const option = current.options.find((item) => item.id === optionId);
    if (!option) throw new Error(`选项不存在：${optionId}`);

    this.applyChoiceVariables(option);
    this.state.isWaitingChoice = false;
    return this.jump(option.target.scriptId, option.target.nodeId);
  }

  /** 跳转到指定脚本和节点。 */
  jump(scriptId: string, nodeId: string): RuntimeSnapshot {
    const script = findScript(this.project, scriptId);
    if (!script) throw new Error(`脚本不存在：${scriptId}`);
    const nodeIndex = findNodeIndex(script, nodeId);
    if (nodeIndex < 0) throw new Error(`节点不存在：${scriptId}:${nodeId}`);
    this.state.currentScriptId = scriptId;
    this.state.currentNodeId = nodeId;
    this.state.currentNodeIndex = nodeIndex;
    this.state.isEnded = false;
    this.state.isWaitingChoice = false;
    return this.processCurrentNode();
  }

  /** 获取当前快照。 */
  getSnapshot(): RuntimeSnapshot {
    return this.cloneSnapshot(this.snapshot);
  }

  /** 获取当前可保存状态。 */
  getState(): RuntimeState {
    return this.cloneState(this.state);
  }

  /** 从保存状态恢复运行时。 */
  loadState(state: RuntimeState): RuntimeSnapshot {
    this.state = this.cloneState(state);
    this.variables.load(state.variables);
    return this.processCurrentNode();
  }

  /** 创建初始运行状态。 */
  private createInitialState(scriptId: string): RuntimeState {
    const script = findScript(this.project, scriptId);
    const firstNode = script?.nodes[0];
    return {
      currentScriptId: scriptId,
      currentNodeId: firstNode?.id ?? null,
      currentNodeIndex: 0,
      backgroundAssetId: undefined,
      characters: [],
      audio: {},
      variables: {},
      isWaitingChoice: false,
      isEnded: false
    };
  }

  /** 执行当前节点，自动跳过不需要玩家确认的节点。 */
  private processCurrentNode(): RuntimeSnapshot {
    while (!this.state.isEnded) {
      const node = this.getCurrentNode();
      if (!node) return this.markEnded();
      this.state.currentNodeId = node.id;
      if (node.type === "dialogue") return this.showDialogue(node.characterId, node.text);
      if (node.type === "narration") return this.showDialogue(null, node.text);
      if (node.type === "choice") return this.showChoices(node);
      this.applyAutoNode(node);
    }
    return this.getSnapshot();
  }

  /** 获取当前节点。 */
  private getCurrentNode(): StoryNode | undefined {
    const script = findScript(this.project, this.state.currentScriptId);
    if (!script) return undefined;
    return findNodeByIndex(script, this.state.currentNodeIndex);
  }

  /** 处理自动推进节点。 */
  private applyAutoNode(node: StoryNode): void {
    if (node.type === "jump") {
      this.applyJump(node.target);
      return;
    }
    if (node.type === "setVariable") this.variables.set(node.name, node.value);
    if (node.type === "scene") this.state.backgroundAssetId = node.backgroundAssetId;
    if (node.type === "showCharacter") this.showCharacter(node.characterId, node.assetId, node.position);
    if (node.type === "hideCharacter") this.hideCharacter(node.characterId);
    if (node.type === "playAudio") this.state.audio[node.channel] = node.assetId;
    if (node.type === "stopAudio") delete this.state.audio[node.channel];
    if (node.type === "condition") {
      const matched = node.branches.find((branch) => this.conditionEvaluator.evaluate(branch));
      const target = matched?.target ?? node.fallbackTarget;
      if (target) {
        this.applyJump(target);
        return;
      }
    }
    this.state.variables = this.variables.snapshot();
    this.state.currentNodeIndex += 1;
  }

  /** 应用内部跳转，不立即创建快照。 */
  private applyJump(target: NodeTarget): void {
    const script = findScript(this.project, target.scriptId);
    if (!script) throw new Error(`脚本不存在：${target.scriptId}`);
    const index = findNodeIndex(script, target.nodeId);
    if (index < 0) throw new Error(`节点不存在：${target.scriptId}:${target.nodeId}`);
    this.state.currentScriptId = target.scriptId;
    this.state.currentNodeIndex = index;
    this.state.currentNodeId = target.nodeId;
  }

  /** 显示或更新角色状态。 */
  private showCharacter(characterId: string, assetId?: string, position?: "left" | "center" | "right"): void {
    const current = this.state.characters.filter((item) => item.characterId !== characterId);
    current.push({ characterId, assetId, position });
    this.state.characters = current;
  }

  /** 隐藏角色状态。 */
  private hideCharacter(characterId: string): void {
    this.state.characters = this.state.characters.filter((item) => item.characterId !== characterId);
  }

  /** 应用选项附带的变量写入。 */
  private applyChoiceVariables(option: ChoiceOption): void {
    for (const [name, value] of Object.entries(option.setVariables ?? {})) {
      this.variables.set(name, value);
    }
    this.state.variables = this.variables.snapshot();
  }

  /** 创建对话快照。 */
  private showDialogue(speaker: string | null, text: string): RuntimeSnapshot {
    this.state.isWaitingChoice = false;
    this.state.variables = this.variables.snapshot();
    this.snapshot = this.createSnapshot("dialogue", speaker, text, []);
    return this.getSnapshot();
  }

  /** 创建选项快照。 */
  private showChoices(node: Extract<StoryNode, { type: "choice" }>): RuntimeSnapshot {
    this.state.isWaitingChoice = true;
    this.state.variables = this.variables.snapshot();
    this.snapshot = this.createSnapshot("choices", null, node.prompt ?? "", node.options);
    return this.getSnapshot();
  }

  /** 标记剧情结束。 */
  private markEnded(): RuntimeSnapshot {
    this.state.isEnded = true;
    this.state.currentNodeId = null;
    this.state.variables = this.variables.snapshot();
    this.snapshot = this.createSnapshot("ended", null, "", []);
    return this.getSnapshot();
  }

  /** 创建运行时快照。 */
  private createSnapshot(
    type: RuntimeSnapshot["type"],
    speaker: string | null,
    text: string,
    choices: ChoiceOption[]
  ): RuntimeSnapshot {
    return {
      type,
      currentScriptId: this.state.currentScriptId,
      currentNodeId: this.state.currentNodeId,
      backgroundAssetId: this.state.backgroundAssetId,
      characters: this.state.characters.map((item) => ({ ...item })),
      speaker,
      text,
      choices: choices.map((choice) => ({ ...choice, setVariables: { ...choice.setVariables }, target: { ...choice.target } })),
      variables: this.variables.snapshot(),
      audio: { ...this.state.audio },
      isEnded: this.state.isEnded
    };
  }

  /** 复制运行状态，避免外部修改内部状态。 */
  private cloneState(state: RuntimeState): RuntimeState {
    return {
      ...state,
      characters: state.characters.map((item) => ({ ...item })),
      audio: { ...state.audio },
      variables: { ...state.variables }
    };
  }

  /** 复制快照，避免外部修改内部快照。 */
  private cloneSnapshot(snapshot: RuntimeSnapshot): RuntimeSnapshot {
    return {
      ...snapshot,
      characters: snapshot.characters.map((item) => ({ ...item })),
      choices: snapshot.choices.map((choice) => ({ ...choice, setVariables: { ...choice.setVariables }, target: { ...choice.target } })),
      variables: { ...snapshot.variables },
      audio: { ...snapshot.audio }
    };
  }
}
