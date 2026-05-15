# 《无人站的潮汐信》Showcase Demo

## 自动验证导出包

导出 Showcase Web 包后，可以运行：

```bash
pnpm verify:showcase-export
```

该命令会检查导出目录、项目包 JSON、导出 manifest、构建资源目录和 Showcase 依赖素材，并通过临时本地静态服务器确认关键文件可以被浏览器路径访问。它也会检查 manifest 中没有本地绝对路径或 `../` 逃逸路径。

## 当前基线

Showcase 现在覆盖背景、透明角色、多表情、BGM、音效、变量分支、标签跳转、代码型动画模块、PropLayer 物品展示和 Web 导出包。它用于验收当前引擎能力，不代表最终 UI/UX 方案；编辑器整体体验重构仍是后续阶段。

这是一个 3 到 5 分钟的视觉小说展示工程，用于验证当前引擎在真实素材下的实际效果。

## 已覆盖能力

- 真实背景资源。
- 透明角色立绘和多表情切换。
- BGM 与音效播放。
- 语音占位资源。
- Scene / ShowCharacter / HideCharacter / Dialogue / Narration。
- Choice / SetVariable / Condition / Label / Jump。
- PlayAnimationNode 动画模块。
- ShowPropNode / HidePropNode 物品展示。
- PropLayer 物品画面层和 prop 动画模块。
- 存档读档、自动播放、Web 导出包。

## 素材状态

当前 Showcase 主展示素材已经替换为真实或许可清楚的免费素材：

- 背景：Potat0Master School Mini Pack 1。
- 角色：Xiael Tia Sprite 透明 PNG 部件组合。
- BGM：OpenGameArt CC0 音乐。
- 音效：Kenney UI Audio CC0。
- 物品：Wikimedia Commons 旧信和录音带图片。
- 语音：本地生成技术占位。

完整来源见 `CREDITS.md`。

## 运行

```bash
pnpm prepare:showcase-assets
pnpm dev:player:showcase
```

打开：

```txt
http://localhost:5173/?project=showcase
```

## 导出 Web 包

```bash
pnpm export:showcase-web
```

导出目录：

```txt
dist/export/showcase-web-game/
```

用静态服务器运行：

```bash
npx serve dist/export/showcase-web-game
```
