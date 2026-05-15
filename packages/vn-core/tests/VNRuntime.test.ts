import { describe, expect, it } from "vitest";
import type { ScriptFile, VNProject } from "@vn-engine/vn-schema";
import { validateProject } from "@vn-engine/vn-schema";
import projectJson from "../../../examples/demo-game/project.vnproj.json";
import startScriptJson from "../../../examples/demo-game/scripts/start.vn.json";
import { ConditionEvaluator, VariableStore, VNRuntime } from "../src";

/** 创建覆盖 start、next、choice、jump 和条件分支的测试工程。 */
function createProject(): VNProject {
  return {
    id: "test-project",
    name: "测试工程",
    version: "0.1.0",
    startScriptId: "start",
    assets: {
      items: [
        { id: "classroom", name: "教室", type: "background", path: "assets/background/classroom.png" },
        { id: "bgm-test", name: "测试BGM", type: "bgm", path: "assets/audio/bgm.wav" }
      ]
    },
    characters: [{ id: "lin", name: "林澄", expressions: [] }],
    variables: [{ name: "stay", type: "boolean", defaultValue: false }],
    scripts: [
      {
        id: "start",
        name: "开始",
        nodes: [
          { id: "scene", type: "scene", backgroundAssetId: "classroom" },
          { id: "play-bgm", type: "playAudio", channel: "bgm", assetId: "bgm-test", loop: true },
          { id: "hello", type: "dialogue", characterId: "lin", text: "你来了。" },
          {
            id: "choice",
            type: "choice",
            prompt: "要留下吗？",
            options: [
              { id: "stay", text: "留下", setVariables: { stay: true }, target: { scriptId: "start", nodeId: "branch" } },
              { id: "leave", text: "离开", setVariables: { stay: false }, target: { scriptId: "start", nodeId: "branch" } }
            ]
          },
          {
            id: "branch",
            type: "condition",
            branches: [
              {
                id: "stay-branch",
                variable: "stay",
                operator: "equals",
                value: true,
                target: { scriptId: "ending", nodeId: "good" }
              }
            ],
            fallbackTarget: { scriptId: "ending", nodeId: "quiet" }
          }
        ]
      },
      {
        id: "ending",
        name: "结局",
        nodes: [
          { id: "good", type: "narration", text: "温柔的结尾。" },
          { id: "stop-bgm", type: "stopAudio", channel: "bgm" },
          { id: "quiet", type: "narration", text: "安静离开。" }
        ]
      }
    ]
  };
}

/** 创建与播放器一致的 demo 工程加载结果。 */
function createDemoProjectFromScriptFile(): VNProject {
  return {
    ...(projectJson as Omit<VNProject, "scripts">),
    scripts: [startScriptJson as ScriptFile]
  };
}

function createCharacterEffectProject(): VNProject {
  const project = createProject();
  return {
    ...project,
    assets: {
      items: [
        ...project.assets.items,
        { id: "lin-normal", name: "Lin normal", type: "character", path: "assets/lin-normal.png" }
      ]
    },
    characters: [{ id: "lin", name: "Lin", expressions: [{ id: "normal", name: "Normal", assetId: "lin-normal" }] }],
    scripts: [
      {
        id: "start",
        name: "character-effects",
        nodes: [
          { id: "show-first", type: "showCharacter", characterId: "lin", expression: "normal", position: "left", enterEffect: "slideInLeft", transitionDurationMs: 600 },
          { id: "dialogue-first", type: "dialogue", characterId: "lin", text: "first" },
          { id: "narration-next", type: "narration", text: "next" },
          { id: "hide-first", type: "hideCharacter", characterId: "lin", exitEffect: "fadeOut", transitionDurationMs: 400 },
          { id: "show-second", type: "showCharacter", characterId: "lin", expression: "normal", position: "right", enterEffect: "fadeIn", transitionDurationMs: 300 },
          { id: "dialogue-second", type: "dialogue", characterId: "lin", text: "second" }
        ]
      }
    ]
  };
}

function createBackgroundEffectProject(): VNProject {
  const project = createProject();
  return {
    ...project,
    scripts: [
      {
        id: "start",
        name: "background-effects",
        nodes: [
          { id: "scene-first", type: "scene", backgroundAssetId: "classroom", transition: "fade", transitionDurationMs: 600 },
          { id: "dialogue-first", type: "dialogue", characterId: "lin", text: "first" },
          { id: "narration-next", type: "narration", text: "next" }
        ]
      }
    ]
  };
}

function createPropProject(): VNProject {
  const project = createProject();
  return {
    ...project,
    assets: {
      items: [
        ...project.assets.items,
        { id: "prop-letter", name: "旧信", type: "prop", path: "assets/prop/old_letter.png" }
      ]
    },
    scripts: [
      {
        id: "start",
        name: "prop",
        nodes: [
          { id: "show-letter", type: "showProp", propId: "prop-letter", assetId: "prop-letter", x: 640, y: 360, scale: 1, opacity: 1, zIndex: 10, enterAnimationId: "prop.revealCenter" },
          { id: "dialogue-first", type: "dialogue", characterId: "lin", text: "letter" },
          { id: "hide-letter", type: "hideProp", propId: "prop-letter", exitAnimationId: "prop.fadeOut" },
          { id: "dialogue-second", type: "dialogue", characterId: "lin", text: "hidden" }
        ]
      }
    ]
  };
}

describe("VNRuntime", () => {
  it("从起始脚本第一个可展示节点开始", () => {
    const runtime = new VNRuntime(createProject());
    const snapshot = runtime.start();
    expect(snapshot.type).toBe("dialogue");
    expect(snapshot.backgroundAssetId).toBe("classroom");
    expect(snapshot.audio.bgm).toBe("bgm-test");
    expect(snapshot.currentNodeId).toBe("hello");
    expect(snapshot.text).toBe("你来了。");
  });

  it("next 推进到选项节点", () => {
    const runtime = new VNRuntime(createProject());
    runtime.start();
    const snapshot = runtime.next();
    expect(snapshot.type).toBe("choices");
    expect(snapshot.choices).toHaveLength(2);
  });

  it("choice 会写入变量并进入条件分支", () => {
    const runtime = new VNRuntime(createProject());
    runtime.start();
    runtime.next();
    const snapshot = runtime.choose("stay");
    expect(snapshot.currentScriptId).toBe("ending");
    expect(snapshot.currentNodeId).toBe("good");
    expect(snapshot.variables.stay).toBe(true);
  });

  it("条件不成立时进入 fallback 分支", () => {
    const runtime = new VNRuntime(createProject());
    runtime.start();
    runtime.next();
    const snapshot = runtime.choose("leave");
    expect(snapshot.currentNodeId).toBe("quiet");
    expect(snapshot.text).toBe("安静离开。");
  });

  it("jump 可以直接跳转到指定节点", () => {
    const runtime = new VNRuntime(createProject());
    runtime.start();
    const snapshot = runtime.jump("ending", "quiet");
    expect(snapshot.currentScriptId).toBe("ending");
    expect(snapshot.currentNodeId).toBe("quiet");
  });

  it("PlayAudioNode 会更新音频状态并自动进入下一个可展示节点", () => {
    const runtime = new VNRuntime(createProject());
    const snapshot = runtime.start();
    expect(snapshot.currentNodeId).toBe("hello");
    expect(snapshot.audio.bgm).toBe("bgm-test");
  });

  it("StopAudioNode 会停止对应通道并自动进入下一个可展示节点", () => {
    const runtime = new VNRuntime(createProject());
    runtime.start();
    runtime.next();
    const good = runtime.choose("stay");
    expect(good.audio.bgm).toBe("bgm-test");
    const quiet = runtime.next();
    expect(quiet.currentNodeId).toBe("quiet");
    expect(quiet.audio.bgm).toBeUndefined();
  });

  it("demo 工程文件可以直接通过 schema 校验", () => {
    const result = validateProject(projectJson as VNProject);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("播放器加载方式可以通过 schema 校验", () => {
    const result = validateProject(createDemoProjectFromScriptFile());
    expect(result.valid).toBe(true);
  });

  it("demo 的留下分支可以完整抵达结束状态", () => {
    const runtime = new VNRuntime(createDemoProjectFromScriptFile());
    expect(runtime.start().currentNodeId).toBe("action-sequence-intro");
    expect(runtime.getSnapshot().isWaitingForActionCompletion).toBe(true);
    expect(runtime.completeActionSequence().currentNodeId).toBe("narration-intro");
    expect(runtime.next().currentNodeId).toBe("dialogue-greeting");
    expect(runtime.next().type).toBe("choices");
    expect(runtime.choose("stay").currentNodeId).toBe("ending-a");
    expect(runtime.next().currentNodeId).toBe("final-end");
    const ended = runtime.next();
    expect(ended.isEnded).toBe(true);
    expect(ended.currentNodeId).toBeNull();
  });

  it("demo 的离开分支可以完整抵达结束状态", () => {
    const runtime = new VNRuntime(createDemoProjectFromScriptFile());
    runtime.start();
    runtime.completeActionSequence();
    runtime.next();
    runtime.next();
    expect(runtime.choose("leave").currentNodeId).toBe("ending-b");
    expect(runtime.next().currentNodeId).toBe("final-end");
    const ended = runtime.next();
    expect(ended.isEnded).toBe(true);
  });

  it("getState 和 loadState 可以恢复脚本、节点、变量、背景、角色、音频状态", () => {
    const runtime = new VNRuntime(createDemoProjectFromScriptFile());
    runtime.start();
    runtime.completeActionSequence();
    runtime.next();
    runtime.next();
    const choiceSnapshot = runtime.choose("stay");
    const state = runtime.getState();

    const restored = new VNRuntime(createDemoProjectFromScriptFile());
    const restoredSnapshot = restored.loadState(state);

    expect(restoredSnapshot.currentScriptId).toBe(choiceSnapshot.currentScriptId);
    expect(restoredSnapshot.currentNodeId).toBe(choiceSnapshot.currentNodeId);
    expect(restoredSnapshot.variables.stayed).toBe(true);
    expect(restoredSnapshot.backgroundAssetId).toBe("bg-classroom");
    expect(restoredSnapshot.characters[0]).toMatchObject({
      characterId: "lincheng",
      assetId: "lincheng-smile",
      expression: "smile",
      position: "center",
      scale: 1.05,
      opacity: 1,
      zIndex: 2,
      flipX: false
    });
    expect(restoredSnapshot.audio.bgm).toBe("bgm-main-theme");
    expect(restoredSnapshot.audio.voice).toBeUndefined();
  });

  it("loadState 后 getSnapshot 可以恢复当前对话文本和画面状态", () => {
    const runtime = new VNRuntime(createDemoProjectFromScriptFile());
    runtime.start();
    const beforeSave = runtime.completeActionSequence();
    const state = runtime.getState();

    const restored = new VNRuntime(createDemoProjectFromScriptFile());
    restored.loadState(state);
    const snapshot = restored.getSnapshot();

    expect(snapshot.text).toBe(beforeSave.text);
    expect(snapshot.backgroundAssetId).toBe(beforeSave.backgroundAssetId);
    expect(snapshot.characters).toEqual(beforeSave.characters);
    expect(snapshot.audio).toEqual(beforeSave.audio);
  });

  it("SceneNode 会更新背景转场状态", () => {
    const runtime = new VNRuntime(createDemoProjectFromScriptFile());
    const snapshot = runtime.start();
    expect(snapshot.background).toMatchObject({ assetId: "bg-classroom" });
    expect(snapshot.background?.transition).toBeUndefined();
    expect(snapshot.pendingEffects[0]).toMatchObject({
      type: "backgroundTransition",
      backgroundAssetId: "bg-classroom",
      transition: "fade",
      transitionDurationMs: 600
    });
  });

  it("ShowCharacterNode 会更新角色演出状态", () => {
    const runtime = new VNRuntime(createDemoProjectFromScriptFile());
    const snapshot = runtime.start();
    expect(snapshot.characters[0]).toMatchObject({
      position: "center",
      scale: 1.05,
      opacity: 1,
      zIndex: 2,
      flipX: false
    });
    expect(snapshot.characters[0].enterEffect).toBeUndefined();
    expect(snapshot.characters[0].transitionDurationMs).toBeUndefined();
    expect(snapshot.pendingEffects.find((effect) => effect.type === "showCharacter")).toMatchObject({
      type: "showCharacter",
      characterId: "lincheng",
      enterEffect: "slideInLeft",
      transitionDurationMs: 500
    });
  });

  it("ShowPropNode 添加物品状态且普通对话不重复生成物品入场动画", () => {
    const runtime = new VNRuntime(createPropProject());
    const first = runtime.start();

    expect(first.currentNodeId).toBe("show-letter");
    expect(first.isWaitingForActionCompletion).toBe(true);
    expect(first.props).toHaveLength(1);
    expect(first.props[0]).toMatchObject({ propId: "prop-letter", assetId: "prop-letter" });
    expect(first.pendingAnimations[0]).toMatchObject({ animationId: "prop.revealCenter", waitForCompletion: true });

    const dialogue = runtime.completeAnimation();
    expect(dialogue.currentNodeId).toBe("dialogue-first");
    expect(dialogue.props).toHaveLength(1);
    expect(dialogue.pendingAnimations).toHaveLength(0);

    const hide = runtime.next();
    expect(hide.currentNodeId).toBe("hide-letter");
    expect(hide.props).toHaveLength(0);
    expect(hide.pendingAnimations.map((animation) => animation.animationId)).toEqual(["prop.fadeOut"]);
  });

  it("getState/loadState 能恢复物品静态状态且不重播入场动画", () => {
    const runtime = new VNRuntime(createPropProject());
    const first = runtime.start();
    const state = runtime.getState();
    const restored = new VNRuntime(createPropProject());
    const snapshot = restored.loadState(state);

    expect(first.props).toHaveLength(1);
    expect(snapshot.props).toHaveLength(1);
    expect(snapshot.pendingAnimations).toEqual([]);
  });

  it("HideCharacterNode 会生成退场 pendingEffects", () => {
    const runtime = new VNRuntime(createDemoProjectFromScriptFile());
    runtime.start();
    runtime.completeActionSequence();
    runtime.next();
    runtime.next();
    runtime.choose("stay");
    const snapshot = runtime.next();
    expect(snapshot.pendingEffects[0]).toMatchObject({
      type: "hideCharacter",
      characterId: "lincheng",
      exitEffect: "fadeOut",
      transitionDurationMs: 500
    });
  });

  it("CameraNode 会更新镜头状态并可被 getState/loadState 恢复", () => {
    const runtime = new VNRuntime(createDemoProjectFromScriptFile());
    runtime.start();
    runtime.completeActionSequence();
    runtime.next();
    const choices = runtime.next();
    expect(choices.camera.zoom).toBe(1.04);

    const restored = new VNRuntime(createDemoProjectFromScriptFile());
    const restoredSnapshot = restored.loadState(runtime.getState());
    expect(restoredSnapshot.camera.zoom).toBe(1.04);
  });

  it("start 会初始化项目级变量默认值", () => {
    const runtime = new VNRuntime(createDemoProjectFromScriptFile());
    const snapshot = runtime.start();
    expect(snapshot.variables.affection).toBe(0);
    expect(snapshot.variables.stayed).toBe(false);
    expect(snapshot.variables.endingHint).toBe("");
  });

  it("set/add/subtract 变量节点会更新变量并记录日志", () => {
    const project = createProject();
    project.variables = [{ name: "score", type: "number", defaultValue: 1 }];
    project.scripts = [
      {
        id: "start",
        name: "start",
        nodes: [
          { id: "add", type: "setVariable", variableName: "score", operator: "add", value: 2 },
          { id: "subtract", type: "setVariable", variableName: "score", operator: "subtract", value: 1 },
          { id: "text", type: "narration", text: "done" }
        ]
      }
    ];
    const snapshot = new VNRuntime(project).start();
    expect(snapshot.variables.score).toBe(2);
    expect(snapshot.debugLog.some((event) => event.type === "variable")).toBe(true);
  });

  it("ConditionEvaluator 支持比较、包含和逻辑组合", () => {
    const variables = new VariableStore({ score: 2, name: "lincheng", flag: true });
    const evaluator = new ConditionEvaluator(variables);
    expect(evaluator.evaluateExpression({ kind: "variable", variableName: "score", operator: "eq", value: 2 })).toBe(true);
    expect(evaluator.evaluateExpression({ kind: "variable", variableName: "score", operator: "ne", value: 3 })).toBe(true);
    expect(evaluator.evaluateExpression({ kind: "variable", variableName: "score", operator: "gt", value: 1 })).toBe(true);
    expect(evaluator.evaluateExpression({ kind: "variable", variableName: "score", operator: "gte", value: 2 })).toBe(true);
    expect(evaluator.evaluateExpression({ kind: "variable", variableName: "score", operator: "lt", value: 3 })).toBe(true);
    expect(evaluator.evaluateExpression({ kind: "variable", variableName: "score", operator: "lte", value: 2 })).toBe(true);
    expect(evaluator.evaluateExpression({ kind: "variable", variableName: "name", operator: "contains", value: "cheng" })).toBe(true);
    expect(evaluator.evaluateExpression({ kind: "variable", variableName: "name", operator: "notContains", value: "x" })).toBe(true);
    expect(evaluator.evaluateExpression({
      kind: "and",
      conditions: [
        { kind: "variable", variableName: "flag", operator: "eq", value: true },
        { kind: "not", condition: { kind: "variable", variableName: "score", operator: "lt", value: 2 } }
      ]
    })).toBe(true);
    expect(evaluator.evaluateExpression({
      kind: "or",
      conditions: [
        { kind: "variable", variableName: "flag", operator: "eq", value: false },
        { kind: "variable", variableName: "score", operator: "gte", value: 2 }
      ]
    })).toBe(true);
  });

  it("ConditionNode 可以跳 trueTarget 和 falseTarget", () => {
    const project = createProject();
    project.variables = [{ name: "flag", type: "boolean", defaultValue: false }];
    project.scripts = [
      {
        id: "start",
        name: "start",
        nodes: [
          {
            id: "condition",
            type: "condition",
            condition: { kind: "variable", variableName: "flag", operator: "eq", value: true },
            trueTarget: { scriptId: "start", nodeId: "true-text" },
            falseTarget: { scriptId: "start", nodeId: "false-text" }
          },
          { id: "true-text", type: "narration", text: "true" },
          { id: "false-text", type: "narration", text: "false" }
        ]
      }
    ];
    expect(new VNRuntime(project).start().currentNodeId).toBe("false-text");
    project.variables = [{ name: "flag", type: "boolean", defaultValue: true }];
    expect(new VNRuntime(project).start().currentNodeId).toBe("true-text");
  });

  it("JumpNode 和 ChoiceOption 可以跳到 label，LabelNode 会自动跳过", () => {
    const project = createProject();
    project.variables = [{ name: "go", type: "boolean", defaultValue: false }];
    project.scripts = [
      {
        id: "start",
        name: "start",
        nodes: [
          { id: "jump", type: "jump", target: { scriptId: "start", label: "target_label" } },
          { id: "choice", type: "choice", options: [{ id: "go", text: "go", target: { scriptId: "start", label: "target_label" } }] },
          { id: "label", type: "label", name: "target_label" },
          { id: "text", type: "narration", text: "arrived" }
        ]
      }
    ];
    const runtime = new VNRuntime(project);
    expect(runtime.start().currentNodeId).toBe("text");
    expect(runtime.getDebugLog().some((event) => event.type === "jump")).toBe(true);

    project.scripts[0].nodes.shift();
    const choiceRuntime = new VNRuntime(project);
    choiceRuntime.start();
    expect(choiceRuntime.choose("go").currentNodeId).toBe("text");
  });

  it("ActionSequenceNode 会进入动作等待态并应用 MVP 动作最终状态", () => {
    const runtime = new VNRuntime(createDemoProjectFromScriptFile());
    const snapshot = runtime.start();
    expect(snapshot.type).toBe("action");
    expect(snapshot.isWaitingForActionCompletion).toBe(true);
    expect(snapshot.pendingActions.map((action) => action.actionType)).toContain("wait");
    expect(snapshot.pendingActions.map((action) => action.actionType)).not.toContain("parallel");
    expect(snapshot.pendingActions.map((action) => action.actionType)).not.toContain("changeExpression");
    expect(snapshot.backgroundAssetId).toBe("bg-classroom");
    expect(snapshot.characters[0]).toMatchObject({
      characterId: "lincheng",
      expression: "smile",
      position: "center",
      scale: 1.05
    });
    expect(snapshot.camera.zoom).toBe(1.03);
    expect(snapshot.audio.voice).toBe("voice-lincheng-001");
    expect(snapshot.debugLog.some((event) => event.type === "action")).toBe(true);
  });

  it("动作等待期间 next 不会绕过等待，completeActionSequence 只推进一次", () => {
    const runtime = new VNRuntime(createDemoProjectFromScriptFile());
    const waiting = runtime.start();
    expect(waiting.currentNodeId).toBe("action-sequence-intro");

    const stillWaiting = runtime.next();
    expect(stillWaiting.currentNodeId).toBe("action-sequence-intro");
    expect(stillWaiting.isWaitingForActionCompletion).toBe(true);

    const completed = runtime.completeActionSequence();
    expect(completed.currentNodeId).toBe("narration-intro");
    expect(completed.isWaitingForActionCompletion).toBe(false);
    expect(completed.pendingActions).toHaveLength(0);

    const repeated = runtime.completeActionSequence();
    expect(repeated.currentNodeId).toBe("narration-intro");
  });

  it("waitForCompletion=false 的动作序列会自动继续到下一个可展示节点", () => {
    const project = createDemoProjectFromScriptFile();
    const sequence = project.scripts[0].nodes.find((node) => node.id === "action-sequence-intro");
    if (sequence?.type === "actionSequence") sequence.waitForCompletion = false;
    const runtime = new VNRuntime(project);
    const snapshot = runtime.start();
    expect(snapshot.currentNodeId).toBe("narration-intro");
    expect(snapshot.isWaitingForActionCompletion).toBe(false);
  });

  it("getSaveState/loadState 不会恢复到动作执行中间态", () => {
    const runtime = new VNRuntime(createDemoProjectFromScriptFile());
    runtime.start();
    const restored = new VNRuntime(createDemoProjectFromScriptFile());
    const saveState = runtime.getSaveState();
    expect(saveState.isWaitingForActionCompletion).toBe(false);
    expect(saveState.pendingActions).toHaveLength(0);
    const snapshot = restored.loadState(saveState);
    expect(snapshot.currentNodeId).toBe("narration-intro");
    expect(snapshot.isWaitingForActionCompletion).toBe(false);
    expect(snapshot.pendingActions).toHaveLength(0);
    expect(snapshot.characters[0]?.expression).toBe("smile");
    expect(snapshot.camera.zoom).toBe(1.03);
    expect(snapshot.audio.voice).toBe("voice-lincheng-001");
  });

  it("loadState 会防御性清理旧的动作等待状态", () => {
    const runtime = new VNRuntime(createDemoProjectFromScriptFile());
    runtime.start();
    const dirtyState = runtime.getState();
    const restored = new VNRuntime(createDemoProjectFromScriptFile());
    const snapshot = restored.loadState(dirtyState);
    expect(snapshot.currentNodeId).toBe("narration-intro");
    expect(snapshot.isWaitingForActionCompletion).toBe(false);
    expect(snapshot.pendingActions).toHaveLength(0);
  });

  it("PlayAnimationNode 会生成一次性 pending animation 并等待完成", () => {
    const project = createProject();
    project.scripts[0].nodes = [
      {
        id: "anim",
        type: "playAnimation",
        animationId: "character.softEnter",
        targets: { main: { type: "character", id: "lin" } },
        params: { durationMs: 300 },
        waitForCompletion: true,
        autoNext: true
      },
      { id: "text", type: "narration", text: "done" }
    ];
    const runtime = new VNRuntime(project);
    const waiting = runtime.start();
    expect(waiting.type).toBe("action");
    expect(waiting.currentNodeId).toBe("anim");
    expect(waiting.isWaitingForActionCompletion).toBe(true);
    expect(waiting.pendingAnimations[0]).toMatchObject({ animationId: "character.softEnter", waitForCompletion: true });

    expect(runtime.next().currentNodeId).toBe("anim");
    const completed = runtime.completeAnimation();
    expect(completed.currentNodeId).toBe("text");
    expect(completed.pendingAnimations).toHaveLength(0);
    expect(runtime.completeAnimation().currentNodeId).toBe("text");
  });

  it("PlayAnimationNode waitForCompletion=false 会挂到下一个快照且不会被存档重播", () => {
    const project = createProject();
    project.scripts[0].nodes = [
      {
        id: "anim",
        type: "playAnimation",
        animationId: "camera.softZoom",
        targets: { camera: { type: "camera" } },
        params: { zoom: 1.05 },
        waitForCompletion: false,
        autoNext: true
      },
      { id: "text", type: "narration", text: "done" }
    ];
    const runtime = new VNRuntime(project);
    const snapshot = runtime.start();
    expect(snapshot.currentNodeId).toBe("text");
    expect(snapshot.isWaitingForActionCompletion).toBe(false);
    expect(snapshot.pendingAnimations[0]).toMatchObject({ animationId: "camera.softZoom", waitForCompletion: false });

    const restored = new VNRuntime(project);
    const restoredSnapshot = restored.loadState(runtime.getState());
    expect(restoredSnapshot.pendingAnimations).toHaveLength(0);
  });

  it("ShowPropNode 带入场动画时会等待一次，普通对话不会重复触发", () => {
    const runtime = new VNRuntime(createPropProject());
    const waiting = runtime.start();
    expect(waiting.currentNodeId).toBe("show-letter");
    expect(waiting.type).toBe("action");
    expect(waiting.isWaitingForActionCompletion).toBe(true);
    expect(waiting.props[0]).toMatchObject({ propId: "prop-letter", assetId: "prop-letter" });
    expect(waiting.pendingAnimations[0]).toMatchObject({ animationId: "prop.revealCenter", waitForCompletion: true });

    const blocked = runtime.next();
    expect(blocked.currentNodeId).toBe("show-letter");

    const dialogue = runtime.completeAnimation();
    expect(dialogue.currentNodeId).toBe("dialogue-first");
    expect(dialogue.props[0]).toMatchObject({ propId: "prop-letter" });
    expect(dialogue.pendingAnimations).toHaveLength(0);

    const hideWaiting = runtime.next();
    expect(hideWaiting.currentNodeId).toBe("hide-letter");
    expect(hideWaiting.isWaitingForActionCompletion).toBe(true);
    expect(hideWaiting.pendingAnimations[0]).toMatchObject({ animationId: "prop.fadeOut", waitForCompletion: true });

    const afterHide = runtime.completeAnimation();
    expect(afterHide.currentNodeId).toBe("dialogue-second");
    expect(afterHide.props).toHaveLength(0);
    expect(afterHide.pendingAnimations).toHaveLength(0);
  });

  it("getSaveState/loadState 恢复物品时不会重播入场动画", () => {
    const runtime = new VNRuntime(createPropProject());
    runtime.start();
    const saveState = runtime.getSaveState();
    expect(saveState.isWaitingForActionCompletion).toBe(false);
    expect(saveState.pendingAnimations).toHaveLength(0);
    expect(saveState.props[0]).toMatchObject({ propId: "prop-letter" });

    const restored = new VNRuntime(createPropProject());
    const snapshot = restored.loadState(saveState);
    expect(snapshot.currentNodeId).toBe("dialogue-first");
    expect(snapshot.props[0]).toMatchObject({ propId: "prop-letter" });
    expect(snapshot.pendingAnimations).toHaveLength(0);
  });

  it("DialogueNode 和 NarrationNode 不会重复携带角色入场 pendingEffects", () => {
    const runtime = new VNRuntime(createCharacterEffectProject());
    const first = runtime.start();
    expect(first.pendingEffects[0]).toMatchObject({ type: "showCharacter", characterId: "lin", enterEffect: "slideInLeft" });

    const nextDialogue = runtime.next();
    expect(nextDialogue.currentNodeId).toBe("narration-next");
    expect(nextDialogue.pendingEffects).toHaveLength(0);
    expect(nextDialogue.characters[0].enterEffect).toBeUndefined();
  });

  it("HideCharacterNode 后再次 ShowCharacterNode 可以重新生成入场 pendingEffects", () => {
    const runtime = new VNRuntime(createCharacterEffectProject());
    runtime.start();
    runtime.next();
    const secondShow = runtime.next();
    expect(secondShow.currentNodeId).toBe("dialogue-second");
    expect(secondShow.pendingEffects.map((effect) => effect.type)).toEqual(["hideCharacter", "showCharacter"]);
    expect(secondShow.pendingEffects[1]).toMatchObject({ characterId: "lin", enterEffect: "fadeIn" });
  });

  it("loadState 恢复已登场角色时不会产生入场 pendingEffects", () => {
    const runtime = new VNRuntime(createCharacterEffectProject());
    const first = runtime.start();
    const restored = new VNRuntime(createCharacterEffectProject());
    const snapshot = restored.loadState(runtime.getState());
    expect(first.pendingEffects).toHaveLength(1);
    expect(snapshot.characters[0]).toMatchObject({ characterId: "lin", position: "left" });
    expect(snapshot.pendingEffects).toHaveLength(0);
    expect(snapshot.characters[0].enterEffect).toBeUndefined();
  });

  it("DialogueNode 和 NarrationNode 不会重复携带背景转场 pendingEffects", () => {
    const runtime = new VNRuntime(createBackgroundEffectProject());
    const first = runtime.start();
    expect(first.pendingEffects[0]).toMatchObject({ type: "backgroundTransition", backgroundAssetId: "classroom", transition: "fade" });

    const next = runtime.next();
    expect(next.currentNodeId).toBe("narration-next");
    expect(next.background).toMatchObject({ assetId: "classroom" });
    expect(next.background?.transition).toBeUndefined();
    expect(next.pendingEffects.some((effect) => effect.type === "backgroundTransition")).toBe(false);
  });
});
