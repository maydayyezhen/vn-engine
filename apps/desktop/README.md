# apps/desktop

该目录是 `vn-engine` 的 Tauri 桌面壳。界面仍由 `apps/editor` 提供，桌面壳只负责浏览器无法完成的本地能力。

## 当前能力

- 新建本地视觉小说工程目录。
- 打开已有本地视觉小说工程目录。
- 读取 `project.vnproj.json` 和 `scripts/*.vn.json`。
- 保存当前工程到 `project.vnproj.json` 与 `scripts/*.vn.json`。
- 选择本地图片或音频素材，并复制到当前工程 `assets` 子目录。
- 返回工程内相对路径给编辑器登记到素材库。
- 选择导出目录并导出完整 Web 游戏包。

## 工程目录结构

```txt
my-vn-project/
├─ project.vnproj.json
├─ scripts/
│  └─ start.vn.json
└─ assets/
   ├─ background/
   ├─ character/
   ├─ audio/
   │  ├─ bgm/
   │  ├─ sound/
   │  └─ voice/
   ├─ image/
   └─ video/
```

## 路径规则

项目 JSON 只保存工程内相对路径，例如 `assets/audio/bgm/main-theme.mp3`。桌面命令不会把用户电脑上的绝对路径写回项目 JSON，也会拒绝包含 `../` 的逃逸路径。

## 运行

```bash
pnpm dev:desktop
```

构建桌面包：

```bash
pnpm build:desktop
```

## 边界

- 不实现节点图。
- 不实现自定义脚本语言。
- 不接入后端或数据库。
- 不处理 API Key 或付费 AI API。
- Rust 命令只负责本地文件能力，业务数据结构和导出校验仍由 TypeScript packages 维护。
