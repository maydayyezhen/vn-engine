# 路线图

## 第 1 阶段：schema + core + demo-player

状态：已完成。

- 定义 `VNProject`、素材、角色、脚本和 `StoryNode` 联合类型。
- 实现 `validateProject` 基础校验。
- 实现 `VNRuntime` 的 start、next、choose、jump、getState、loadState。
- 打通 `examples/demo-game` 到 `apps/player` 的最小播放流程。

## 第 2 阶段：编辑器基础编辑能力

状态：已完成。

- 实现节点基础表单编辑。
- 实现内存态节点新增、删除、复制和修改。
- 增加工程校验结果展示。
- 增加基于 `vn-core` 的编辑器底部预览。

## 第 3 阶段：项目 JSON 导入导出

状态：已完成。

- `packages/vn-project` 提供 `ProjectBundle`、序列化、反序列化和深拷贝。
- 编辑器支持导出当前项目 JSON。
- 编辑器支持导入 `ProjectBundle` 或裸 `VNProject` JSON。
- 支持重置 demo 和 dirty 状态展示。

## 第 4 阶段：素材库与资源引用闭环

状态：已完成。

- `vn-schema` 增强素材、角色和表情结构。
- `validateProject` 校验背景、角色、表情、音频素材引用。
- 编辑器支持素材元数据新增、编辑、删除。
- 编辑器支持角色和角色表情映射新增、编辑、删除。
- 节点属性面板通过资源下拉框引用背景、角色、表情和音频。
- 预览区显示解析后的资源名称和路径。

## 第 5 阶段：PixiJS 渲染层

状态：未开始。

让 `vn-renderer-pixi` 接收 `RuntimeSnapshot`，实现背景层、角色立绘层、特效层、转场动画和画面滤镜。

## 第 6 阶段：Tauri 本地工程读写

状态：未开始。

接入桌面壳能力，支持打开本地项目文件夹、读写工程文件、导入素材和调用系统文件选择器。

## 第 7 阶段：导出 Web 游戏包和存档系统

状态：未开始。

实现 Web 游戏导出、运行时存档、读档和基础工程发布流程。

## 第 8 阶段：演出时间轴、转场、语音、历史记录、设置菜单

状态：未开始。

增强演出能力和玩家运行时 UI，包括自动播放、快进、历史记录、音量设置和语音控制。

## 第 9 阶段：可选脚本文法和 vn-compiler

状态：未开始。

如果结构化 JSON 无法满足创作效率，再在 `vn-compiler` 中设计类 Ren'Py 的脚本文法并转换为 `StoryNode`。
