import { Buffer } from "node:buffer";
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const showcaseDir = path.join(rootDir, "examples/showcase-game");
const sourceAssetsDir = path.join(showcaseDir, "assets");
const publicAssetsDir = path.join(rootDir, "apps/player/public/showcase-assets");

function assetPath(relativePath) {
  return path.join(sourceAssetsDir, relativePath);
}

function publicPath(relativePath) {
  return path.join(publicAssetsDir, relativePath);
}

async function writeIfMissing(filePath, content) {
  if (existsSync(filePath)) return;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content);
}

function svgBackground(title, top, bottom, accent) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${top}"/>
      <stop offset="1" stop-color="${bottom}"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#sky)"/>
  <rect y="488" width="1280" height="232" fill="#15202b" opacity="0.78"/>
  <path d="M0 520 C220 470 370 550 560 500 C770 445 940 535 1280 474 L1280 720 L0 720 Z" fill="${accent}" opacity="0.65"/>
  <rect x="110" y="388" width="1060" height="44" rx="8" fill="#f8fafc" opacity="0.5"/>
  <rect x="180" y="320" width="920" height="86" rx="10" fill="#111827" opacity="0.52"/>
  <text x="640" y="374" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="38" fill="#f8fafc">${title}</text>
</svg>`;
}

function svgHeroine(expression) {
  const mouth = expression === "sad" ? "M272 346 Q300 330 328 346" : expression === "surprised" ? "M296 336 a18 22 0 1 0 1 0" : "M270 334 Q300 360 330 334";
  const eye = expression === "sad" ? "M238 268 Q260 254 282 268" : "M240 260 Q262 248 284 260";
  const blush = expression === "smile" ? '<ellipse cx="226" cy="312" rx="34" ry="12" fill="#fda4af" opacity="0.45"/><ellipse cx="374" cy="312" rx="34" ry="12" fill="#fda4af" opacity="0.45"/>' : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="520" height="900" viewBox="0 0 520 900">
  <rect width="520" height="900" fill="none"/>
  <ellipse cx="260" cy="870" rx="150" ry="24" fill="#020617" opacity="0.2"/>
  <path d="M170 384 C122 462 110 650 132 842 L388 842 C410 650 398 462 350 384 Z" fill="#1e3a8a"/>
  <path d="M188 412 C218 456 302 456 332 412 L352 842 L168 842 Z" fill="#dbeafe"/>
  <path d="M164 206 C164 90 356 90 356 206 C382 250 374 344 330 384 C300 412 220 412 190 384 C146 344 138 250 164 206 Z" fill="#3f2d22"/>
  <ellipse cx="260" cy="270" rx="112" ry="128" fill="#ffd7b5"/>
  <path d="M172 222 C210 150 300 140 354 220 C330 178 232 188 172 222 Z" fill="#3f2d22"/>
  <path d="${eye}" fill="none" stroke="#111827" stroke-width="8" stroke-linecap="round"/>
  <path d="M316 260 Q338 248 360 260" fill="none" stroke="#111827" stroke-width="8" stroke-linecap="round"/>
  ${blush}
  <path d="${mouth}" fill="none" stroke="#9f1239" stroke-width="7" stroke-linecap="round"/>
  <text x="260" y="70" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="28" fill="#0f172a" opacity="0.5">${expression}</text>
</svg>`;
}

function svgProp(title, icon) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320">
  <rect width="480" height="320" fill="none"/>
  <rect x="64" y="56" width="352" height="208" rx="18" fill="#f8fafc" stroke="#334155" stroke-width="8"/>
  <text x="240" y="150" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="72" fill="#475569">${icon}</text>
  <text x="240" y="218" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="32" fill="#0f172a">${title}</text>
</svg>`;
}

function wavBuffer(seconds, frequency, volume = 0.16) {
  const sampleRate = 44100;
  const sampleCount = Math.floor(seconds * sampleRate);
  const dataSize = sampleCount * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let index = 0; index < sampleCount; index += 1) {
    const t = index / sampleRate;
    const envelope = Math.min(1, t * 5, (seconds - t) * 5);
    const value = Math.sin(2 * Math.PI * frequency * t) * envelope * volume;
    buffer.writeInt16LE(Math.max(-1, Math.min(1, value)) * 32767, 44 + index * 2);
  }
  return buffer;
}

const project = {
  id: "showcase-game",
  name: "无人站的潮汐信 Showcase Demo",
  version: "0.1.0",
  startScriptId: "start",
  variables: [
    { name: "openedLetter", type: "boolean", defaultValue: false, description: "玩家是否打开旧信。" },
    { name: "affection", type: "number", defaultValue: 0, description: "短篇展示用好感度。" },
    { name: "endingHint", type: "string", defaultValue: "", description: "结尾提示文本。" }
  ],
  assets: {
    items: [
      { id: "bg-station-evening", name: "黄昏无人站", type: "background", path: "/showcase-assets/background/station_evening.svg", description: "Showcase占位背景，可替换为Potat0Master真实素材。" },
      { id: "bg-classroom-day", name: "白日教室", type: "background", path: "/showcase-assets/background/classroom_day.svg", description: "Showcase占位背景，可替换为Potat0Master真实素材。" },
      { id: "bg-hallway-day", name: "白日走廊", type: "background", path: "/showcase-assets/background/hallway_day.svg", description: "Showcase占位背景，可替换为Potat0Master真实素材。" },
      { id: "bg-seaside-night", name: "夜色海边", type: "background", path: "/showcase-assets/background/seaside_night.svg", description: "Showcase占位背景，可替换为Potat0Master真实素材。" },
      { id: "heroine-normal", name: "潮见澪 普通", type: "character", path: "/showcase-assets/character/heroine/normal.svg", description: "项目脚本生成的透明占位立绘。" },
      { id: "heroine-smile", name: "潮见澪 微笑", type: "character", path: "/showcase-assets/character/heroine/smile.svg", description: "项目脚本生成的透明占位立绘。" },
      { id: "heroine-sad", name: "潮见澪 难过", type: "character", path: "/showcase-assets/character/heroine/sad.svg", description: "项目脚本生成的透明占位立绘。" },
      { id: "heroine-surprised", name: "潮见澪 惊讶", type: "character", path: "/showcase-assets/character/heroine/surprised.svg", description: "项目脚本生成的透明占位立绘。" },
      { id: "prop-old-letter", name: "旧信", type: "image", path: "/showcase-assets/prop/old_letter.svg", description: "项目脚本生成的占位道具。当前引擎暂无正式PropLayer。" },
      { id: "prop-cassette-tape", name: "录音带", type: "image", path: "/showcase-assets/prop/cassette_tape.svg", description: "项目脚本生成的占位道具。当前引擎暂无正式PropLayer。" },
      { id: "bgm-showcase-theme", name: "潮汐主题BGM", type: "bgm", path: "/showcase-assets/audio/bgm/showcase_theme.wav", description: "项目脚本生成的可复现占位BGM。" },
      { id: "bgm-memory-theme", name: "回忆主题BGM", type: "bgm", path: "/showcase-assets/audio/bgm/memory_theme.wav", description: "项目脚本生成的可复现占位BGM。" },
      { id: "sound-click", name: "点击提示音", type: "sound", path: "/showcase-assets/audio/sound/click.wav", description: "项目脚本生成的占位音效。" },
      { id: "sound-page", name: "翻页声", type: "sound", path: "/showcase-assets/audio/sound/page.wav", description: "项目脚本生成的占位音效。" },
      { id: "sound-flash", name: "闪回声", type: "sound", path: "/showcase-assets/audio/sound/flash.wav", description: "项目脚本生成的占位音效。" },
      { id: "voice-heroine-001", name: "潮见澪 占位语音", type: "voice", path: "/showcase-assets/audio/voice/heroine_001.wav", description: "项目脚本生成的占位语音，不使用TTS API。" }
    ]
  },
  characters: [
    {
      id: "mio",
      name: "潮见澪",
      displayName: "潮见澪",
      defaultAssetId: "heroine-normal",
      color: "#6aa7ff",
      description: "Showcase Demo女主角。",
      expressions: [
        { id: "normal", name: "普通", assetId: "heroine-normal" },
        { id: "smile", name: "微笑", assetId: "heroine-smile" },
        { id: "sad", name: "难过", assetId: "heroine-sad" },
        { id: "surprised", name: "惊讶", assetId: "heroine-surprised" }
      ]
    }
  ],
  scripts: []
};

const startScript = {
  id: "start",
  name: "无人站的潮汐信",
  nodes: [
    { id: "label-start", type: "label", name: "start", description: "Showcase开场。" },
    { id: "scene-station", type: "scene", backgroundAssetId: "bg-station-evening", transition: "fade", transitionDurationMs: 700 },
    { id: "play-bgm-showcase", type: "playAudio", channel: "bgm", assetId: "bgm-showcase-theme", loop: true },
    { id: "narration-line-1", type: "narration", text: "夏末的海风穿过无人站，像一封迟到很久的信。", textSpeed: 38, waitForClick: true },
    { id: "narration-line-2", type: "narration", text: "支线铁路明天废止。今天，是最后一班黄昏车。", textSpeed: 38, waitForClick: true },
    { id: "show-mio", type: "showCharacter", characterId: "mio", assetId: "heroine-normal", expression: "normal", position: "left", enterEffect: "none", transitionDurationMs: 0, scale: 1, opacity: 1, zIndex: 1, flipX: false },
    { id: "anim-mio-enter", type: "playAnimation", animationId: "character.softEnter", targets: { main: { type: "character", id: "mio" } }, params: { durationMs: 800, offsetX: -160, startScale: 0.94, endScale: 1 }, waitForCompletion: true, autoNext: true },
    { id: "voice-mio-001", type: "playAudio", channel: "voice", assetId: "voice-heroine-001", loop: false },
    { id: "dialogue-mio-greeting", type: "dialogue", characterId: "mio", text: "你真的来了。我还以为，这座车站会替我们把话都吞掉。", textSpeed: 42, waitForClick: true },
    { id: "set-affection-start", type: "setVariable", variableName: "affection", operator: "add", value: 1 },
    { id: "show-mio-smile", type: "showCharacter", characterId: "mio", assetId: "heroine-smile", expression: "smile", position: "left", transitionDurationMs: 0, scale: 1, opacity: 1, zIndex: 1, flipX: false },
    { id: "dialogue-mio-smile", type: "dialogue", characterId: "mio", text: "别露出那种表情。只是废站，又不是世界末日。", textSpeed: 42, waitForClick: true },
    { id: "anim-camera-zoom", type: "playAnimation", animationId: "camera.softZoom", targets: { camera: { type: "camera" } }, params: { durationMs: 650, zoom: 1.06 }, waitForCompletion: false, autoNext: true },
    { id: "show-mio-sad", type: "showCharacter", characterId: "mio", assetId: "heroine-sad", expression: "sad", position: "left", transitionDurationMs: 0, scale: 1, opacity: 1, zIndex: 1, flipX: false },
    { id: "dialogue-mio-letter", type: "dialogue", characterId: "mio", text: "我在候车室找到一封旧信。署名……是三年前的你。", textSpeed: 42, waitForClick: true },
    { id: "sound-page", type: "playAudio", channel: "sound", assetId: "sound-page", loop: false },
    { id: "anim-screen-flash", type: "playAnimation", animationId: "screen.flashWhite", targets: { screen: { type: "screen" } }, params: { durationMs: 420, intensity: 0.7 }, waitForCompletion: true, autoNext: true },
    { id: "scene-classroom", type: "scene", backgroundAssetId: "bg-classroom-day", transition: "fade", transitionDurationMs: 500 },
    { id: "narration-memory", type: "narration", text: "纸页翻开的瞬间，走廊尽头的蝉声又回到了耳边。", textSpeed: 36, waitForClick: true },
    { id: "scene-hallway", type: "scene", backgroundAssetId: "bg-hallway-day", transition: "slideLeft", transitionDurationMs: 500 },
    { id: "show-mio-surprised", type: "showCharacter", characterId: "mio", assetId: "heroine-surprised", expression: "surprised", position: "center", transitionDurationMs: 0, scale: 1, opacity: 1, zIndex: 1, flipX: false },
    { id: "dialogue-mio-surprised", type: "dialogue", characterId: "mio", text: "原来那天你没有离开。你只是……没来得及说出口。", textSpeed: 42, waitForClick: true },
    { id: "anim-mio-shake", type: "playAnimation", animationId: "character.nervousShake", targets: { main: { type: "character", id: "mio" } }, params: { durationMs: 450, amplitude: 10, repeat: 5 }, waitForCompletion: true, autoNext: true },
    { id: "choice-letter", type: "choice", prompt: "旧信还在掌心。", options: [
      { id: "open-letter", text: "打开那封信", setVariables: { openedLetter: true, endingHint: "letter" }, target: { scriptId: "start", label: "after-choice" } },
      { id: "keep-letter", text: "先把它收起来", setVariables: { openedLetter: false, endingHint: "silence" }, target: { scriptId: "start", label: "after-choice" } }
    ] },
    { id: "label-after-choice", type: "label", name: "after-choice", description: "选择后统一判断。" },
    { id: "condition-ending", type: "condition", condition: { kind: "and", conditions: [
      { kind: "variable", variableName: "openedLetter", operator: "eq", value: true },
      { kind: "variable", variableName: "affection", operator: "gte", value: 1 }
    ] }, trueTarget: { scriptId: "start", label: "ending-open" }, falseTarget: { scriptId: "start", label: "ending-keep" } },
    { id: "label-ending-open", type: "label", name: "ending-open", description: "打开信结尾。" },
    { id: "scene-night-open", type: "scene", backgroundAssetId: "bg-seaside-night", transition: "fade", transitionDurationMs: 800 },
    { id: "play-memory-bgm", type: "playAudio", channel: "bgm", assetId: "bgm-memory-theme", loop: true },
    { id: "show-mio-open-smile", type: "showCharacter", characterId: "mio", assetId: "heroine-smile", expression: "smile", position: "center", transitionDurationMs: 0, scale: 1, opacity: 1, zIndex: 1, flipX: false },
    { id: "dialogue-mio-open", type: "dialogue", characterId: "mio", text: "如果那封信还能抵达，那我们就不算真正错过。", textSpeed: 42, waitForClick: true },
    { id: "anim-fade-black-open", type: "playAnimation", animationId: "screen.fadeToBlack", targets: { screen: { type: "screen" } }, params: { direction: "in", durationMs: 900, opacity: 0.75 }, waitForCompletion: true, autoNext: true },
    { id: "stop-bgm-open", type: "stopAudio", channel: "bgm" },
    { id: "narration-ending-open", type: "narration", text: "最后一班车驶过海堤时，潮声把没说出口的话，轻轻还给了我们。", textSpeed: 34, waitForClick: true },
    { id: "jump-end-open", type: "jump", target: { scriptId: "start", label: "the-end" } },
    { id: "label-ending-keep", type: "label", name: "ending-keep", description: "收起信结尾。" },
    { id: "scene-night-keep", type: "scene", backgroundAssetId: "bg-seaside-night", transition: "slideRight", transitionDurationMs: 800 },
    { id: "show-mio-keep-sad", type: "showCharacter", characterId: "mio", assetId: "heroine-sad", expression: "sad", position: "center", transitionDurationMs: 0, scale: 1, opacity: 1, zIndex: 1, flipX: false },
    { id: "dialogue-mio-keep", type: "dialogue", characterId: "mio", text: "那就等明天吧。不是所有告别，都必须在今天拆封。", textSpeed: 42, waitForClick: true },
    { id: "hide-mio", type: "hideCharacter", characterId: "mio", exitEffect: "fadeOut", transitionDurationMs: 600 },
    { id: "stop-bgm-keep", type: "stopAudio", channel: "bgm" },
    { id: "narration-ending-keep", type: "narration", text: "她的脚步声消失在站台尽头，旧信仍带着黄昏的温度。", textSpeed: 34, waitForClick: true },
    { id: "label-the-end", type: "label", name: "the-end", description: "Showcase结束。" },
    { id: "narration-end", type: "narration", text: "《无人站的潮汐信》Showcase Demo 完。", textSpeed: 34, waitForClick: true }
  ]
};

async function copyPublic(relativePath) {
  await mkdir(path.dirname(publicPath(relativePath)), { recursive: true });
  await copyFile(assetPath(relativePath), publicPath(relativePath));
}

async function main() {
  await mkdir(showcaseDir, { recursive: true });
  await mkdir(path.join(showcaseDir, "scripts"), { recursive: true });

  const files = new Map([
    ["background/station_evening.svg", svgBackground("无人站 · 黄昏", "#f59e0b", "#334155", "#0ea5e9")],
    ["background/classroom_day.svg", svgBackground("旧教室 · 白日", "#93c5fd", "#fef3c7", "#64748b")],
    ["background/hallway_day.svg", svgBackground("走廊 · 回忆", "#bfdbfe", "#e2e8f0", "#475569")],
    ["background/seaside_night.svg", svgBackground("海边 · 夜", "#111827", "#1e3a8a", "#38bdf8")],
    ["character/heroine/normal.svg", svgHeroine("normal")],
    ["character/heroine/smile.svg", svgHeroine("smile")],
    ["character/heroine/sad.svg", svgHeroine("sad")],
    ["character/heroine/surprised.svg", svgHeroine("surprised")],
    ["prop/old_letter.svg", svgProp("Old Letter", "✉")],
    ["prop/cassette_tape.svg", svgProp("Cassette Tape", "▣")]
  ]);

  for (const [relativePath, content] of files) {
    await writeIfMissing(assetPath(relativePath), content);
    await copyPublic(relativePath);
  }

  const audioFiles = new Map([
    ["audio/bgm/showcase_theme.wav", wavBuffer(12, 220, 0.13)],
    ["audio/bgm/memory_theme.wav", wavBuffer(10, 165, 0.12)],
    ["audio/sound/click.wav", wavBuffer(0.18, 720, 0.22)],
    ["audio/sound/page.wav", wavBuffer(0.28, 360, 0.2)],
    ["audio/sound/flash.wav", wavBuffer(0.35, 880, 0.18)],
    ["audio/voice/heroine_001.wav", wavBuffer(1.4, 440, 0.12)]
  ]);

  for (const [relativePath, buffer] of audioFiles) {
    await writeIfMissing(assetPath(relativePath), buffer);
    await copyPublic(relativePath);
  }

  await writeIfMissing(path.join(showcaseDir, "project.vnproj.json"), `${JSON.stringify({ ...project, scripts: [startScript] }, null, 2)}\n`);
  await writeIfMissing(path.join(showcaseDir, "scripts/start.vn.json"), `${JSON.stringify(startScript, null, 2)}\n`);
  await writeIfMissing(path.join(showcaseDir, "README.md"), `# 无人站的潮汐信 Showcase Demo

这是用于验证 vn-engine 当前完整链路的 3 到 5 分钟展示工程。它覆盖背景、透明角色立绘、多表情、BGM、音效、语音占位、变量分支、Label 跳转、PlayAnimationNode、存档读档和 Web 导出。

## 准备素材

\`\`\`bash
pnpm prepare:showcase-assets
\`\`\`

脚本会生成可运行的本地占位素材，并把浏览器可访问副本复制到 \`apps/player/public/showcase-assets/\`。真实免费素材请按 \`MANUAL_DOWNLOAD.md\` 手动下载并替换同名文件。

## 运行

\`\`\`bash
pnpm dev:player:showcase
\`\`\`

打开：

\`\`\`text
http://localhost:5173/?project=showcase
\`\`\`

编辑器中可用“加载 Showcase Demo”入口载入。

## 当前限制

当前没有正式 PropLayer，旧信和录音带以 \`image\` 素材登记，剧本用旁白和屏幕动画表现物品展示。后续可在 PropLayer 中完善真实道具层。
`);
  await writeIfMissing(path.join(showcaseDir, "MANUAL_DOWNLOAD.md"), `# Showcase 真实素材手动下载说明

当前脚本不会绕过 itch.io 或 Kenney 的下载限制；如果无法稳定自动下载，会保留本地生成占位素材，保证项目可运行。要替换为真实素材，请手动下载以下来源中少量文件，并重命名到对应路径。

## 背景

- 页面：https://potat0master.itch.io/free-visual-novel-backgrounds-school-mini-pack-1
- 页面：https://potat0master.itch.io/free-visual-novel-backgrounds-mini-pack-1
- 作者：Potat0Master
- 建议选择 3 到 5 张背景，重命名为：
  - \`examples/showcase-game/assets/background/station_evening.svg\`
  - \`examples/showcase-game/assets/background/classroom_day.svg\`
  - \`examples/showcase-game/assets/background/hallway_day.svg\`
  - \`examples/showcase-game/assets/background/seaside_night.svg\`

如果真实文件是 PNG 或 WebP，请同步修改 \`project.vnproj.json\` 中的路径，并复制到 \`apps/player/public/showcase-assets/background/\`。

## 角色

- 页面：https://potat0master.itch.io/free-characters-for-visual-novels-set-a01
- 作者：Potat0Master
- 建议选择一个角色的 normal、smile、sad、surprised 四张透明立绘，放到：
  - \`examples/showcase-game/assets/character/heroine/\`
  - \`apps/player/public/showcase-assets/character/heroine/\`

## BGM

- 页面：https://potat0master.itch.io/free-background-music-for-visual-novels-bgm-pack-1
- 作者：Potat0Master
- 建议选择 1 到 2 首，放到：
  - \`examples/showcase-game/assets/audio/bgm/\`
  - \`apps/player/public/showcase-assets/audio/bgm/\`

## 音效

- 页面：https://kenney.nl/assets/category:Audio
- 页面：https://kenney.nl/assets/digital-audio
- 作者：Kenney
- 许可：CC0
- 建议选择点击、翻页、提示类少量音效，放到：
  - \`examples/showcase-game/assets/audio/sound/\`
  - \`apps/player/public/showcase-assets/audio/sound/\`

## 语音

本轮不接 TTS API。语音默认由本地脚本生成占位 WAV。
`);
  await writeIfMissing(path.join(showcaseDir, "CREDITS.md"), `# Showcase Credits

## Bundled fallback assets

- Source: Generated by local project script \`scripts/prepare-showcase-assets.mjs\`
- License: Project-local technical placeholder assets
- Files used:
  - \`assets/background/*.svg\`
  - \`assets/character/heroine/*.svg\`
  - \`assets/prop/*.svg\`
  - \`assets/audio/**/*.wav\`
- Note: These assets are only for technical showcase and can be replaced with the sources below.

## Recommended real backgrounds

- Source: Free Visual Novel Backgrounds (School Mini Pack 1)
- Author: Potat0Master
- URL: https://potat0master.itch.io/free-visual-novel-backgrounds-school-mini-pack-1
- License: Free visual novel asset pack; check the itch.io page for current license text before publishing.
- Files used in repository: none bundled automatically; see \`MANUAL_DOWNLOAD.md\`.

- Source: Free Visual Novel Backgrounds (Mini Pack 1)
- Author: Potat0Master
- URL: https://potat0master.itch.io/free-visual-novel-backgrounds-mini-pack-1
- License: Free visual novel asset pack; check the itch.io page for current license text before publishing.
- Files used in repository: none bundled automatically; see \`MANUAL_DOWNLOAD.md\`.

## Recommended real character sprites

- Source: Free Characters for Visual Novels (Set A01) - School Ver.
- Author: Potat0Master
- URL: https://potat0master.itch.io/free-characters-for-visual-novels-set-a01
- License: Free visual novel character asset pack; check the itch.io page for current license text before publishing.
- Files used in repository: none bundled automatically; see \`MANUAL_DOWNLOAD.md\`.

## Recommended real BGM

- Source: Free Background Music for Visual Novels (BGM Pack 1)
- Author: Potat0Master
- URL: https://potat0master.itch.io/free-background-music-for-visual-novels-bgm-pack-1
- License: Free BGM asset pack; check the itch.io page for current license text before publishing.
- Files used in repository: none bundled automatically; see \`MANUAL_DOWNLOAD.md\`.

## Recommended sound effects

- Source: Digital Audio
- Author: Kenney
- URL: https://kenney.nl/assets/digital-audio
- License: CC0
- Files used in repository: none bundled automatically; see \`MANUAL_DOWNLOAD.md\`.

Download date for source review: 2026-05-15.
`);

  console.log(`Prepared showcase project in ${showcaseDir}`);
  console.log(`Prepared browser assets in ${publicAssetsDir}`);
  console.log("Real asset replacement instructions: examples/showcase-game/MANUAL_DOWNLOAD.md");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
