# apps/editor

最小可用编辑器。当前使用 Vue3 + Vite + TypeScript + Element Plus 展示并编辑 demo-game 的项目树、节点列表、节点属性、素材库、角色库、校验结果、运行预览和 Web 导出检查。

当前能力：

- 内存态编辑结构化 JSON 剧本。
- 新增、复制、删除基础节点。
- 使用 `vn-core` 预览当前内存项目。
- 导出当前项目为 `ProjectBundle` JSON。
- 导入 `ProjectBundle` JSON 或裸 `VNProject` JSON。
- 重置为 demo 项目。
- 显示 dirty 状态和校验状态。
- 新增、编辑、删除素材元数据。
- 新增、编辑、删除角色和角色表情。
- 在节点属性面板中通过下拉框选择背景、角色、表情和音频。
- Web 导出视图展示导出校验、素材引用、规范化导出路径，并可导出 `project.bundle.json`。

Web 导出限制：

- 当前 Web 编辑器只负责 ProjectBundle JSON 和导出校验。
- 当前 Web 编辑器不能选择任意本地导出目录。
- 当前 Web 编辑器不能复制任意本地素材文件。
- 完整静态游戏目录导出由命令行 `pnpm export:demo-web` 验证，后续 Tauri 阶段再接真实文件系统。

通用限制：

- 不实现拖拽排序。
- 不实现节点图。
- 不接真实 Tauri 文件系统。
- 不做真实磁盘工程保存；导入导出通过浏览器 Web 文件能力完成。
- 素材仍是路径元数据，不管理真实图片或音频文件。
- 预览仍是文字化调试预览，不做真实渲染或播放。
