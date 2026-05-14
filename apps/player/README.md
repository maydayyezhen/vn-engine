# apps/player

最小 Web 播放器。第一阶段使用 Vue3 + Vite + TypeScript 读取 demo-game 数据，并通过 `@vn-engine/vn-core` 驱动剧情。

该应用不引入 Element Plus，不使用后台管理风格组件库。Vue 组件只展示 `RuntimeSnapshot` 并触发 `next`、`choose` 等运行时操作。
