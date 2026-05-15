# Showcase 真实素材手动下载说明

当前脚本不会绕过 itch.io 或 Kenney 的下载限制；如果无法稳定自动下载，会保留本地生成占位素材，保证项目可运行。要替换为真实素材，请手动下载以下来源中少量文件，并重命名到对应路径。

## 背景

- 页面：https://potat0master.itch.io/free-visual-novel-backgrounds-school-mini-pack-1
- 页面：https://potat0master.itch.io/free-visual-novel-backgrounds-mini-pack-1
- 作者：Potat0Master
- 建议选择 3 到 5 张背景，重命名为：
  - `examples/showcase-game/assets/background/station_evening.svg`
  - `examples/showcase-game/assets/background/classroom_day.svg`
  - `examples/showcase-game/assets/background/hallway_day.svg`
  - `examples/showcase-game/assets/background/seaside_night.svg`

如果真实文件是 PNG 或 WebP，请同步修改 `project.vnproj.json` 中的路径，并复制到 `apps/player/public/showcase-assets/background/`。

## 角色

- 页面：https://potat0master.itch.io/free-characters-for-visual-novels-set-a01
- 作者：Potat0Master
- 建议选择一个角色的 normal、smile、sad、surprised 四张透明立绘，放到：
  - `examples/showcase-game/assets/character/heroine/`
  - `apps/player/public/showcase-assets/character/heroine/`

## BGM

- 页面：https://potat0master.itch.io/free-background-music-for-visual-novels-bgm-pack-1
- 作者：Potat0Master
- 建议选择 1 到 2 首，放到：
  - `examples/showcase-game/assets/audio/bgm/`
  - `apps/player/public/showcase-assets/audio/bgm/`

## 音效

- 页面：https://kenney.nl/assets/category:Audio
- 页面：https://kenney.nl/assets/digital-audio
- 作者：Kenney
- 许可：CC0
- 建议选择点击、翻页、提示类少量音效，放到：
  - `examples/showcase-game/assets/audio/sound/`
  - `apps/player/public/showcase-assets/audio/sound/`

## 语音

本轮不接 TTS API。语音默认由本地脚本生成占位 WAV。
