# Showcase 素材替换说明

当前仓库已经内置真实/半真实 Showcase 素材：

- 背景：Potat0Master 的 School Mini Pack 1 WebP。
- 角色：Xiael 的 Tia Sprite 透明 PNG 部件，本项目组合成 4 个表情。
- BGM：OpenGameArt CC0 MP3。
- 音效：Kenney UI Audio CC0 OGG。
- 语音：本地生成占位音频，没有调用 TTS API。
- 道具：本地生成 SVG 占位图，等待后续 PropLayer。

如需替换为其他真实素材，请保持路径和 `project.vnproj.json` 中的资源路径一致。

## 背景替换

推荐来源：

- https://potat0master.itch.io/free-visual-novel-backgrounds-school-mini-pack-1
- https://potat0master.itch.io/free-visual-novel-backgrounds-mini-pack-1

当前文件：

- `assets/background/station_evening.webp`
- `assets/background/classroom_day.webp`
- `assets/background/hallway_day.webp`
- `assets/background/seaside_night.webp`

替换后同步复制到：

- `apps/player/public/showcase-assets/background/`

## 角色替换

当前角色来源：

- https://xiael.itch.io/tia-sprite

当前文件：

- `assets/character/heroine/normal.png`
- `assets/character/heroine/smile.png`
- `assets/character/heroine/sad.png`
- `assets/character/heroine/surprised.png`

替换时建议使用透明 PNG 或 WebP，并更新 `project.vnproj.json` 中对应 `AssetItem.path`。

## BGM 和音效替换

当前 BGM 来源：

- https://opengameart.org/content/cco-mystical-music
- https://opengameart.org/content/nighttime-solitude

当前音效来源：

- https://kenney.nl/assets/ui-audio

替换后同步复制到：

- `apps/player/public/showcase-assets/audio/bgm/`
- `apps/player/public/showcase-assets/audio/sound/`

## 同步命令

修改 `examples/showcase-game/assets/` 后执行：

```bash
pnpm prepare:showcase-assets
```

该命令会把 Showcase 素材同步到 `apps/player/public/showcase-assets/`。
