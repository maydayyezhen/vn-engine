# 无人站的潮汐信 Showcase Demo

这是一个 3 到 5 分钟的视觉小说展示工程，用于验证当前引擎的实际制作效果。

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

当前主展示素材已替换为真实/半真实素材：

- 背景：Potat0Master School Mini Pack 1。
- 角色：Xiael Tia Sprite 透明 PNG 部件组合。
- BGM：OpenGameArt CC0 音乐。
- 音效：Kenney UI Audio CC0。
- 语音：本地生成技术占位。
- 道具：本地生成 SVG 占位，已通过正式 prop 资源类型、ShowPropNode、HidePropNode 和 PropLayer 展示。

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
