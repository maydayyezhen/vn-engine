# 路线图

## 第 1 阶段：schema + core + demo-player

状态：已完成第一轮骨架，并在第二轮完成工程验收。

已完成：

- 定义 `VNProject`、素材、角色、脚本和 `StoryNode` 联合类型。
- 实现 `validateProject` 的基础校验。
- 实现 `VNRuntime` 的 start、next、choose、jump、getState、loadState。
- 支持 Scene、ShowCharacter、HideCharacter、PlayAudio、StopAudio、SetVariable、Condition、Jump 自动节点。
- 打通 `examples/demo-game` 到 `apps/player` 的最小播放流程。
- 补充 demo 校验、两个结局、结束态和状态恢复测试。

## 第 2 阶段：编辑器基础编辑能力

状态：已开始，完成最小可编辑闭环。

已完成：

- 实现节点基础表单编辑。
- 实现内存中的节点新增、删除、复制和修改。
- 增加工程校验结果展示。
- 增加基于 `vn-core` 的编辑器底部预览。

仍未开始：

- 真实文件保存。
- 更完整的节点类型编辑体验。
- 暂不接真实 Tauri 文件系统。
- 暂不做拖拽和节点图。

## 第 3 阶段：PixiJS 渲染层

状态：未开始。

让 `vn-renderer-pixi` 接收 `RuntimeSnapshot`，实现背景层、角色立绘层、特效层、转场动画和画面滤镜。

## 第 4 阶段：Tauri 本地工程读写

状态：未开始。

接入桌面壳能力，支持打开本地项目文件夹、读写工程文件、导入素材和调用系统文件选择器。

## 第 5 阶段：导出 Web 游戏包和存档系统

状态：未开始。

实现 Web 游戏导出、运行时存档、读档和基础工程发布流程。

## 第 6 阶段：演出时间轴、转场、语音、历史记录、设置菜单

状态：未开始。

增强演出能力和玩家运行时 UI，包括自动播放、快进、历史记录、音量设置和语音控制。

## 第 7 阶段：可选脚本文法和 vn-compiler

状态：未开始。

如果结构化 JSON 无法满足创作效率，再在 `vn-compiler` 中设计类 Ren'Py 的脚本文法并转换为 `StoryNode`。
