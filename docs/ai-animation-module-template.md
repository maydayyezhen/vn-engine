# AI 动画模块生成模板

本文件只定义未来“AI 辅助生成动画代码”时应遵守的代码规范。本阶段不接入 AI API，不处理 API Key，也不执行来自不可信来源的动态代码。

## 命名规则

- 动画 id 必须是稳定英文标识，例如 `character.softEnter`、`camera.softZoom`、`screen.flashWhite`。
- id 应使用 `category.name` 形式，避免绑定具体项目、角色或剧情。
- `name` 使用通用中文名，例如“角色柔和入场”，不要写成“林澄入场”。
- `category` 只能使用 `character`、`background`、`camera`、`screen`、`particle`、`prop`、`group`。

## 模块结构

动画代码必须实现 `AnimationModule` 接口：

```ts
import type { AnimationModule } from "../types/AnimationModule";

export const exampleAnimation: AnimationModule = {
  id: "character.example",
  name: "示例角色动画",
  category: "character",
  targetSlots: [{ key: "main", label: "目标角色", type: "character", required: true }],
  paramsSchema: {
    durationMs: { type: "number", label: "时长", default: 600, min: 0, max: 5000, step: 50 }
  },
  async play(ctx, payload) {
    const target = payload.targets.main;
    if (!target?.id) return;
    const sprite = ctx.getCharacterSprite(target.id);
    if (!sprite) return;
    await ctx.wait(Number(payload.params.durationMs ?? 600));
  }
};
```

## 目标和参数

`targetSlots` 告诉编辑器需要哪些目标。`character` 通常需要角色 id；`camera`、`screen`、`particle` 通常不需要 id。`paramsSchema` 用于生成参数表单，支持 `number`、`string`、`boolean`、`select`、`color`。

## 安全边界

动画模块只能使用 `AnimationContext` 暴露的能力。禁止访问 `window`、`document`、`localStorage`、`fetch`、Tauri API；禁止读写文件、引入外部依赖、修改项目数据，或把图片、音频、视频、动画代码写入项目 JSON。

## 注册和验收

新增动画文件后，需要放入可信目录，在 `customAnimations.ts` 或 `builtinAnimations.ts` 中注册，并执行 `pnpm typecheck` 与 `pnpm build`。当前没有插件沙箱、签名系统和权限隔离；AI 生成的动画代码必须人工审查后再注册使用。
