# vn-engine

本项目是本地优先的视觉小说引擎与编辑器 monorepo，用于制作 Galgame/视觉小说。

当前已经打通结构化 JSON 工程、运行时解释器、编辑器内存态编辑、JSON 导入导出、素材库管理、PixiJS 播放器画面，以及浏览器端音频播放同步。项目不包含后端，不包含数据库，不实现自定义脚本语言，也不实现节点图编辑器。

## 环境

- Node.js 24 已验证可用。
- 包管理器使用 pnpm workspace。

## 安装依赖

```bash
pnpm install
```

## 生成 demo 音频

```bash
pnpm generate:demo-audio
```

该命令会生成可复现的技术占位音频：

```text
apps/player/public/demo-assets/audio/bgm-demo.wav
apps/player/public/demo-assets/audio/sound-click.wav
apps/player/public/demo-assets/audio/voice-lincheng-001.wav
```

这些文件只用于验证 BGM、音效、语音的播放和停止链路，不使用网络下载素材，不涉及版权不明资源。项目 JSON 只保存 `/demo-assets/...` 路径元数据。

## 运行播放器 demo

```bash
pnpm dev:player
```

默认地址：

```text
http://localhost:5173/
```

播放器通过 `vn-core` 推进剧情，通过 `vn-renderer-pixi` 渲染 PixiJS 舞台，通过 `vn-audio` 根据运行时快照同步 BGM、音效和语音。音频加载或播放失败会显示提示，不阻断剧情。

## 运行编辑器

```bash
pnpm dev:editor
```

默认地址：

```text
http://localhost:5174/
```

编辑器支持节点编辑、素材库管理、角色表情映射、JSON 导入导出和文字化预览。编辑器预览不播放真实音频。

## 测试

```bash
pnpm test
```

当前测试覆盖：

- `vn-schema` 的脚本、跳转、素材、角色和表情引用校验。
- `vn-core` 的 start、next、choice、jump、条件分支、音频状态、两个 demo 结局和状态恢复。
- `vn-project` 的 JSON 序列化、反序列化、ProjectBundle 兼容和素材/角色数据保留。
- `vn-renderer-pixi` 的渲染资源解析逻辑。
- `vn-audio` 的音频资源解析和快照音频状态解析。

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
- `packages/vn-core` 实现与 Vue、DOM、PixiJS、Tauri、Audio API 解耦的运行时解释器。
- `packages/vn-project` 提供项目序列化、反序列化和深拷贝纯逻辑。
- `packages/vn-renderer-pixi` 接收 `RuntimeSnapshot` 和 `VNProject`，负责 PixiJS 画面渲染。
- `packages/vn-audio` 接收 `RuntimeSnapshot` 和 `VNProject`，负责浏览器端音频同步。
- `apps/player` 使用 Vue 承载 PixiJS 舞台和音频控制，不使用 Element Plus。
- `apps/editor` 使用 Vue3、Vite、TypeScript、Element Plus 搭建编辑器。
- `apps/desktop` 仅预留未来 Tauri 桌面壳说明。

## 当前限制

- 不包含后端。
- 不包含数据库。
- 不接真实 Tauri 文件系统。
- 素材仍是路径元数据，不管理真实图片或音频二进制文件导入。
- 当前没有复杂音频淡入淡出。
- 当前没有复杂转场、演出时间轴、存档菜单。
- 不做节点图编辑器。
- 不实现自定义脚本语言。
