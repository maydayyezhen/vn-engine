# vn-engine

本项目是本地优先的视觉小说引擎与编辑器 monorepo，用于制作 Galgame/视觉小说。

当前已经打通结构化 JSON 工程、运行时解释器、编辑器内存态编辑、JSON 导入导出、素材库元数据管理、角色表情映射管理，以及基于 PixiJS 的最小播放器视觉渲染。项目不包含后端，不包含数据库，不实现自定义脚本语言，也不实现节点图编辑器。

## 环境

- Node.js 24 已验证可用。
- 包管理器使用 pnpm workspace。

## 安装依赖

```bash
pnpm install
```

## 运行播放器 demo

```bash
pnpm dev:player
```

默认地址：

```text
http://localhost:5173/
```

播放器现在通过 `vn-core` 推进剧情，通过 `vn-renderer-pixi` 渲染 PixiJS 舞台。画面包含背景层、角色层、对话层和选项层；真实图片加载失败时会显示占位图形。当前不做真实音频播放、复杂转场、演出时间轴、存档菜单。

## 运行编辑器

```bash
pnpm dev:editor
```

默认地址：

```text
http://localhost:5174/
```

编辑器支持：

- 内存态编辑 demo 剧本节点。
- 新增对话和旁白节点，复制、删除当前节点。
- 使用下拉框选择背景、角色、角色表情和音频素材。
- 管理素材元数据，包括背景、角色图片、BGM、音效、语音等。
- 管理角色和角色表情到素材的映射。
- 使用 `vn-core` 在底部做文字化调试预览。
- 导出当前内存项目为 `ProjectBundle` JSON 文件。
- 从 `ProjectBundle` JSON 或裸 `VNProject` JSON 导入项目。
- 重置为 demo 项目。
- 显示 dirty 状态和校验状态。

## 测试

```bash
pnpm test
```

当前测试覆盖：

- `vn-schema` 的脚本、跳转、素材、角色和表情引用校验。
- `vn-core` 的 start、next、choice、jump、条件分支、两个 demo 结局和状态恢复。
- `vn-project` 的 JSON 序列化、反序列化、ProjectBundle 兼容和素材/角色数据保留。
- `vn-renderer-pixi` 的渲染资源解析逻辑。

## 类型检查

```bash
pnpm typecheck
```

## 构建

```bash
pnpm build
```

## 架构边界

- `packages/vn-schema` 定义工程数据结构和基础校验。
- `packages/vn-core` 实现与 Vue、DOM、PixiJS、Tauri 解耦的运行时解释器。
- `packages/vn-project` 提供项目序列化、反序列化和深拷贝纯逻辑。
- `packages/vn-renderer-pixi` 接收 `RuntimeSnapshot` 和 `VNProject`，负责 PixiJS 画面渲染。
- `apps/player` 使用 Vue 承载 PixiJS 舞台，不使用 Element Plus。
- `apps/editor` 使用 Vue3、Vite、TypeScript、Element Plus 搭建编辑器。
- `apps/desktop` 仅预留未来 Tauri 桌面壳说明。

## 当前限制

- 不包含后端。
- 不包含数据库。
- 不接真实 Tauri 文件系统。
- 素材仍是路径元数据，不管理真实图片或音频二进制文件。
- 播放器会尝试加载图片路径，失败时回退占位图形。
- 当前没有真实音频播放。
- 当前没有复杂转场、演出时间轴、存档菜单。
- 不做节点图编辑器。
- 不实现自定义脚本语言。
