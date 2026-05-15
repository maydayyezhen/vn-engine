# 无人站的潮汐信 Showcase Demo

这是用于验证 vn-engine 当前完整链路的 3 到 5 分钟展示工程。它覆盖背景、透明角色立绘、多表情、BGM、音效、语音占位、变量分支、Label 跳转、PlayAnimationNode、存档读档和 Web 导出。

## 准备素材

```bash
pnpm prepare:showcase-assets
```

脚本会生成可运行的本地占位素材，并把浏览器可访问副本复制到 `apps/player/public/showcase-assets/`。真实免费素材请按 `MANUAL_DOWNLOAD.md` 手动下载并替换同名文件。

## 运行

```bash
pnpm dev:player:showcase
```

打开：

```text
http://localhost:5173/?project=showcase
```

编辑器中可用“加载 Showcase Demo”入口载入。

## 当前限制

当前没有正式 PropLayer，旧信和录音带以 `image` 素材登记，剧本用旁白和屏幕动画表现物品展示。后续可在 PropLayer 中完善真实道具层。
