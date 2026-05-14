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
