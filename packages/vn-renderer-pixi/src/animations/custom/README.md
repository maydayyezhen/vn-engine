# custom 动画目录

这里是实验性的开发者动画目录。

- custom 动画是可执行 TypeScript 代码，不是普通素材。
- 当前只建议个人项目或可信代码使用。
- 不要复制不可信来源的动画代码。
- 当前没有完整插件沙箱、签名和权限系统。
- AI 生成动画代码后，应人工检查，再放入 `custom` 目录。
- custom 动画必须实现 `AnimationModule` 接口。
- custom 动画必须注册到 `animations/registry/customAnimations.ts`。
- 修改后必须运行 `pnpm typecheck` 和 `pnpm build`。
- 后续正式 AI 动画生成或插件系统会单独设计安全链路。
