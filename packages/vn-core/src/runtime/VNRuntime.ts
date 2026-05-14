import type { ChoiceOption, NodeTarget, SetVariableNode, ShowCharacterNode, StoryNode, VariableValue, VNProject } from "@vn-engine/vn-schema";
import { validateProject } from "@vn-engine/vn-schema";
import { ConditionEvaluator } from "../condition/ConditionEvaluator";
import { findNodeByIndex, findNodeIndex, findScript } from "../utils/runtimeLookup";
import { resolveRuntimeTarget } from "../utils/targetResolver";
import { VariableStore } from "../variable/VariableStore";
import type { RuntimeCameraState, RuntimeCharacterDisplay, RuntimeDebugEvent, RuntimeState } from "./RuntimeState";
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
      throw new Error(`工程校验失败：${validation.errors.map((issue) => issue.message).join("; ")}`);
    }

    this.project = project;
    this.variables = new VariableStore();
    this.conditionEvaluator = new ConditionEvaluator(this.variables, (message) => this.addDebugEvent("error", message));
    this.state = this.createInitialState(project.startScriptId);
    this.snapshot = this.createSnapshot("dialogue", null, "", []);
  }

  /** 从起始脚本的第一个节点开始运行。 */
  start(): RuntimeSnapshot {
    this.state = this.createInitialState(this.project.startScriptId);
    this.variables.load(this.createDefaultVariables());
    this.state.variables = this.variables.snapshot();
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
    return this.jumpToTarget(option.target);
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

  /** 跳转到节点或标签目标。 */
  jumpToTarget(target: NodeTarget): RuntimeSnapshot {
    this.applyJump(target);
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

  /** 获取最近运行时调试日志。 */
  getDebugLog(): RuntimeDebugEvent[] {
    return this.state.debugLog.map((event) => ({ ...event }));
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
      background: undefined,
      characters: [],
      camera: this.createDefaultCameraState(),
      pendingEffects: [],
      audio: {},
      variables: this.createDefaultVariables(),
      debugLog: [],
      isWaitingChoice: false,
      isEnded: false
    };
  }

  /** 创建项目变量默认值表。 */
  private createDefaultVariables(): Record<string, VariableValue> {
    return Object.fromEntries((this.project.variables ?? []).map((variable) => [variable.name, variable.defaultValue]));
  }

  /** 执行当前节点，自动跳过不需要玩家确认的节点。 */
  private processCurrentNode(): RuntimeSnapshot {
    while (!this.state.isEnded) {
      const node = this.getCurrentNode();
      if (!node) return this.markEnded();
      this.state.currentNodeId = node.id;
      if (node.type === "dialogue") return this.showDialogue(node.characterId, node.text, node.textSpeed, node.autoNext, node.waitForClick);
      if (node.type === "narration") return this.showDialogue(null, node.text, node.textSpeed, node.autoNext, node.waitForClick);
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
    if (node.type === "label") {
      this.addDebugEvent("jump", `经过标签：${node.name}`, this.state.currentScriptId, node.id);
    }
    if (node.type === "setVariable") this.applySetVariable(node);
    if (node.type === "scene") {
      this.state.backgroundAssetId = node.backgroundAssetId;
      this.state.background = {
        assetId: node.backgroundAssetId,
        transition: node.transition ?? "none",
        transitionDurationMs: node.transitionDurationMs ?? 300
      };
    }
    if (node.type === "showCharacter") this.showCharacter(node);
    if (node.type === "hideCharacter") this.hideCharacter(node.characterId, node.exitEffect ?? "none", node.transitionDurationMs ?? 300);
    if (node.type === "camera") {
      this.state.camera = {
        zoom: node.zoom ?? 1,
        offsetX: node.offsetX ?? 0,
        offsetY: node.offsetY ?? 0,
        shake: node.shake ?? false,
        shakeIntensity: node.shakeIntensity ?? 0,
        durationMs: node.durationMs ?? 300
      };
    }
    if (node.type === "playAudio") this.state.audio[node.channel] = node.assetId;
    if (node.type === "stopAudio") delete this.state.audio[node.channel];
    if (node.type === "condition") {
      let target: NodeTarget | undefined;
      if (node.condition) {
        const result = this.conditionEvaluator.evaluateExpression(node.condition);
        this.addDebugEvent("condition", `条件 ${node.id} 判断结果：${result ? "true" : "false"}`, this.state.currentScriptId, node.id);
        target = result ? node.trueTarget : node.falseTarget;
      } else {
        const matched = (node.branches ?? []).find((branch) => this.conditionEvaluator.evaluate(branch));
        this.addDebugEvent("condition", `旧版条件 ${node.id} 匹配：${matched?.id ?? "fallback"}`, this.state.currentScriptId, node.id);
        target = matched?.target ?? node.fallbackTarget;
      }
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
    const resolved = resolveRuntimeTarget(this.project, target);
    if (!resolved) {
      const message = `跳转目标不存在：${target.scriptId}:${target.nodeId ?? `#${target.label ?? ""}`}`;
      this.addDebugEvent("error", message, this.state.currentScriptId, this.state.currentNodeId ?? undefined);
      throw new Error(message);
    }
    this.addDebugEvent("jump", `跳转到：${resolved.scriptId}:${resolved.nodeId}`, this.state.currentScriptId, this.state.currentNodeId ?? undefined);
    this.state.currentScriptId = resolved.scriptId;
    this.state.currentNodeIndex = resolved.nodeIndex;
    this.state.currentNodeId = resolved.nodeId;
  }

  /** 执行变量赋值节点。 */
  private applySetVariable(node: SetVariableNode): void {
    const name = node.variableName ?? node.name ?? "";
    const operator = node.operator ?? "set";
    const previous = this.variables.get(name);
    let nextValue: VariableValue = node.value;

    if (operator === "add" || operator === "subtract") {
      if (typeof previous !== "number" || typeof node.value !== "number") {
        this.addDebugEvent("error", `变量 ${name} 无法执行 ${operator}，因为当前值或写入值不是 number。`, this.state.currentScriptId, node.id);
      } else {
        nextValue = operator === "add" ? previous + node.value : previous - node.value;
      }
    }

    this.variables.set(name, nextValue);
    this.addDebugEvent("variable", `变量 ${name} ${operator} => ${String(nextValue)}`, this.state.currentScriptId, node.id);
  }

  /** 添加运行时调试事件。 */
  private addDebugEvent(type: RuntimeDebugEvent["type"], message: string, scriptId = this.state?.currentScriptId, nodeId = this.state?.currentNodeId ?? undefined): void {
    if (!this.state) return;
    this.state.debugLog = [
      ...this.state.debugLog,
      {
        id: `debug_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        type,
        message,
        scriptId,
        nodeId,
        createdAt: new Date().toISOString()
      }
    ].slice(-100);
  }

  /** 显示或更新角色状态。 */
  private showCharacter(node: ShowCharacterNode): void {
    const current = this.state.characters.filter((item) => item.characterId !== node.characterId);
    current.push({
      characterId: node.characterId,
      assetId: node.assetId,
      expression: node.expression,
      position: node.position ?? "center",
      x: node.x,
      y: node.y,
      scale: node.scale ?? 1,
      opacity: node.opacity ?? 1,
      zIndex: node.zIndex ?? 0,
      flipX: node.flipX ?? false,
      enterEffect: node.enterEffect ?? "none",
      transitionDurationMs: node.transitionDurationMs ?? 300
    });
    this.state.characters = current;
  }

  /** 隐藏角色状态。 */
  private hideCharacter(characterId: string, exitEffect: RuntimeCharacterDisplay["exitEffect"], transitionDurationMs: number): void {
    const character = this.state.characters.find((item) => item.characterId === characterId);
    if (character) {
      this.state.pendingEffects.push({
        type: "hideCharacter",
        characterId,
        exitEffect: exitEffect ?? "none",
        transitionDurationMs,
        character: { ...character, exitEffect, transitionDurationMs }
      });
    }
    this.state.characters = this.state.characters.filter((item) => item.characterId !== characterId);
  }

  /** 创建默认镜头状态。 */
  private createDefaultCameraState(): RuntimeCameraState {
    return {
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      shake: false,
      shakeIntensity: 0,
      durationMs: 0
    };
  }

  /** 应用选项附带的变量写入。 */
  private applyChoiceVariables(option: ChoiceOption): void {
    for (const [name, value] of Object.entries(option.setVariables ?? {})) {
      this.variables.set(name, value);
      this.addDebugEvent("variable", `选项写入变量 ${name} => ${String(value)}`, this.state.currentScriptId, this.state.currentNodeId ?? undefined);
    }
    this.state.variables = this.variables.snapshot();
  }

  /** 创建对话快照。 */
  private showDialogue(speaker: string | null, text: string, textSpeed?: number, autoNext?: boolean, waitForClick?: boolean): RuntimeSnapshot {
    this.state.isWaitingChoice = false;
    this.state.variables = this.variables.snapshot();
    this.snapshot = this.createSnapshot("dialogue", speaker, text, []);
    this.snapshot.textSpeed = textSpeed;
    this.snapshot.autoNext = autoNext;
    this.snapshot.waitForClick = waitForClick;
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
    const pendingEffects = this.state.pendingEffects.map((effect) => ({
      ...effect,
      character: effect.character ? { ...effect.character } : undefined
    }));
    const snapshot: RuntimeSnapshot = {
      type,
      currentScriptId: this.state.currentScriptId,
      currentNodeId: this.state.currentNodeId,
      backgroundAssetId: this.state.backgroundAssetId,
      background: this.state.background ? { ...this.state.background } : undefined,
      characters: this.state.characters.map((item) => ({ ...item })),
      camera: { ...this.state.camera },
      pendingEffects,
      speaker,
      text,
      choices: choices.map((choice) => ({ ...choice, setVariables: { ...choice.setVariables }, target: { ...choice.target } })),
      variables: this.variables.snapshot(),
      debugLog: this.state.debugLog.map((event) => ({ ...event })),
      audio: { ...this.state.audio },
      isEnded: this.state.isEnded
    };
    this.state.pendingEffects = [];
    return snapshot;
  }

  /** 复制运行状态，避免外部修改内部状态。 */
  private cloneState(state: RuntimeState): RuntimeState {
    return {
      ...state,
      background: state.background ? { ...state.background } : undefined,
      characters: state.characters.map((item) => ({ ...item })),
      camera: { ...(state.camera ?? this.createDefaultCameraState()) },
      pendingEffects: (state.pendingEffects ?? []).map((effect) => ({
        ...effect,
        character: effect.character ? { ...effect.character } : undefined
      })),
      audio: { ...state.audio },
      variables: { ...state.variables },
      debugLog: (state.debugLog ?? []).map((event) => ({ ...event }))
    };
  }

  /** 复制快照，避免外部修改内部快照。 */
  private cloneSnapshot(snapshot: RuntimeSnapshot): RuntimeSnapshot {
    return {
      ...snapshot,
      background: snapshot.background ? { ...snapshot.background } : undefined,
      characters: snapshot.characters.map((item) => ({ ...item })),
      camera: { ...snapshot.camera },
      pendingEffects: snapshot.pendingEffects.map((effect) => ({
        ...effect,
        character: effect.character ? { ...effect.character } : undefined
      })),
      choices: snapshot.choices.map((choice) => ({ ...choice, setVariables: { ...choice.setVariables }, target: { ...choice.target } })),
      variables: { ...snapshot.variables },
      debugLog: (snapshot.debugLog ?? []).map((event) => ({ ...event })),
      audio: { ...snapshot.audio }
    };
  }
}
