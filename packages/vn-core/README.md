# @vn-engine/vn-core

## 动作序列 MVP 返修说明

`ActionSequenceNode` 当前收敛为 MVP：核心动作包括 `wait`、`scene`、`showCharacter`、`hideCharacter`、`moveCharacter`、`camera`、`playAudio`、`stopAudio`。`parallel` 与 `changeExpression` 只作为旧 JSON 兼容能力，不作为新增编辑入口。

当动作序列 `waitForCompletion=true` 时，`VNRuntime` 会在快照中输出 `pendingActions` 和 `isWaitingForActionCompletion=true`。此时 `next()` 只返回当前快照，不会推进；上层播放器必须在渲染器完成后调用 `completeActionSequence()`。存档应调用 `getSaveState()`，该方法会返回动作完成后的稳定状态，并清理 `pendingActions` 与等待标记。

## ActionSequenceNode

第十四轮新增 `ActionSequenceNode` 解释能力。`vn-core` 会按结构化 `VNAction`
计算演出后的最终运行时状态，并在 `RuntimeSnapshot.pendingActions` 中输出动作效果队列。
播放器或编辑器画面预览可以把这些效果交给渲染层播放；核心包本身不依赖 PixiJS、DOM
或音频 API。

当前支持的动作包括 `wait`、`scene`、`showCharacter`、`hideCharacter`、
`moveCharacter`、`changeExpression`、`camera`、`playAudio`、`stopAudio` 和
`parallel`。`waitForCompletion=true` 时，快照会标记
`isWaitingForActionCompletion=true`，由上层播放器等待渲染完成回调后再调用 `next()`。

该包实现最小视觉小说运行时解释器。它只读取 `VNProject` 数据并产出 `RuntimeSnapshot`，不依赖 Vue、DOM、PixiJS、Tauri 或 Element Plus。
## 演出状态

`vn-core` 会把 `SceneNode`、`ShowCharacterNode`、`HideCharacterNode` 和 `CameraNode` 解释为运行时状态：`RuntimeSnapshot.background`、`RuntimeSnapshot.characters`、`RuntimeSnapshot.camera` 和 `RuntimeSnapshot.pendingEffects`。核心包只维护状态，不执行 PixiJS 动画，也不等待动画结束。

## 变量、条件和调试日志

`VNRuntime.start()` 会从 `project.variables` 初始化默认变量。`SetVariableNode` 支持 `set/add/subtract`，`ConditionEvaluator` 支持结构化条件表达式和 `and/or/not` 组合。跳转目标可以解析到节点或 `LabelNode`。运行时会记录最近 100 条变量、条件、跳转和错误日志，并通过 `RuntimeSnapshot.debugLog` 和 `getDebugLog()` 暴露给编辑器与播放器调试面板。
## PlayAnimationNode 运行时规则

`vn-core` 遇到 `PlayAnimationNode` 时只生成一次性 `pendingAnimations`，不执行 Pixi 动画，也不保存动画代码。`waitForCompletion=true` 时，快照会进入等待状态；播放器在渲染器完成回调后调用 `completeAnimation()` 继续剧情。

`getSaveState()` 不保存 pending animation，也不会恢复到动画执行中间态。`loadState()` 后角色、背景、镜头等静态状态直接恢复，不会重播旧动画。
