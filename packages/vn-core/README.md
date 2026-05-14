# @vn-engine/vn-core

该包实现最小视觉小说运行时解释器。它只读取 `VNProject` 数据并产出 `RuntimeSnapshot`，不依赖 Vue、DOM、PixiJS、Tauri 或 Element Plus。
## 演出状态

`vn-core` 会把 `SceneNode`、`ShowCharacterNode`、`HideCharacterNode` 和 `CameraNode` 解释为运行时状态：`RuntimeSnapshot.background`、`RuntimeSnapshot.characters`、`RuntimeSnapshot.camera` 和 `RuntimeSnapshot.pendingEffects`。核心包只维护状态，不执行 PixiJS 动画，也不等待动画结束。
