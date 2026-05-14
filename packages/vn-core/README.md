# @vn-engine/vn-core

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
