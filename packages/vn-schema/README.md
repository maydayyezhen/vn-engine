# @vn-engine/vn-schema

该包定义视觉小说工程的数据结构和基础校验函数。它是项目的数据契约层，不依赖 Vue、DOM、PixiJS、Tauri、Element Plus、后端或数据库。

当前包含：

- `VNProject`、`ScriptFile`、`StoryNode` 等工程结构。
- `AssetItem`、`AssetLibrary`、`AssetType` 等素材结构。
- `Character`、`CharacterExpression` 等角色和表情结构。
- `validateProject(project)` 工程校验函数。

当前校验覆盖：

- 项目 id、起始脚本、脚本 id、节点 id。
- jump、choice、condition 的目标引用。
- 背景、角色、角色表情、音频素材引用。
- 重复素材 id 和重复角色 id。

素材仍是路径元数据，不管理真实二进制文件。
## 编辑器定位信息

`ScriptFile.name` 可作为脚本显示名称使用；旧项目如果没有该字段，编辑器会回退显示脚本 id。`validateProject` 返回的校验项包含 `message`、`level`，并在能够定位时包含 `scriptId` 与 `nodeId`，编辑器可以据此从校验面板跳转到对应脚本和节点。
## 基础演出字段

`vn-schema` 现在定义背景转场、角色入场/退场、角色位置、缩放、透明度、层级、水平翻转、`CameraNode` 和对话表现字段。`validateProject` 会检查非法转场/效果、异常 duration、非法 scale/opacity、自定义位置缺少坐标和异常镜头数值。

## 剧情逻辑结构

`vn-schema` 现在定义项目级变量 `VNVariableDefinition`、增强版 `SetVariableNode`、结构化 `ConditionExpression`、`LabelNode` 和支持标签的 `NodeTarget`。`validateProject` 会检查变量名、默认值类型、未定义变量引用、条件值类型、标签重复和跳转目标断链。
## 动作序列结构

`vn-schema` 现在定义 `ActionSequenceNode` 和 `VNAction`。动作类型包括 `wait`、`scene`、`showCharacter`、`hideCharacter`、`moveCharacter`、`changeExpression`、`camera`、`playAudio`、`stopAudio` 和 `parallel`。`validateProject` 会检查动作 id 重复、非法动作类型、异常 duration、资源引用、角色/表情引用、音频通道、空 parallel 和 custom 位置缺少坐标等问题。校验项在可定位时会附带 `scriptId`、`nodeId` 和 `actionId`。
