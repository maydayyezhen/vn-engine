# 剧本格式

## 工程文件

`project.vnproj.json` 是视觉小说工程入口文件，包含工程 id、名称、版本、起始脚本 id、素材库、角色列表和脚本列表。

编辑器导出的 JSON 使用完整 `VNProject` 数据，必须包含 `scripts`、`characters`、`assets` 等字段。示例目录下仍保留 `scripts/start.vn.json`，用于模拟未来本地工程目录拆分。

## ProjectBundle 导入导出格式

编辑器导出的 JSON 使用 `ProjectBundle` 包结构：

```json
{
  "format": "vn-engine-project",
  "formatVersion": "0.1.0",
  "exportedAt": "2026-05-14T00:00:00.000Z",
  "project": {
    "id": "demo-game",
    "name": "林澄的测试故事",
    "version": "0.1.0",
    "startScriptId": "start",
    "assets": { "items": [] },
    "characters": [],
    "scripts": []
  }
}
```

导入时同时兼容 `ProjectBundle` 和裸 `VNProject`。`ProjectBundle.project` 必须是完整工程数据。

## 素材库

`assets.items` 存放素材元数据：

- `id`：素材唯一 id。
- `name`：素材显示名称。
- `type`：素材类型，支持 `background`、`character`、`bgm`、`sound`、`sfx`、`voice`、`image`、`other`。
- `path`：素材路径或占位路径。
- `description`：可选说明。

项目 JSON 只保存素材元数据，不保存图片、音频、视频二进制，也不使用 base64 内嵌素材。

## 运行时存档格式

播放器运行时存档不写入 `project.vnproj.json`。当前 Web demo 使用浏览器 `localStorage` 保存 `SaveSlot`：

- `slotId`：槽位 id。
- `projectId`：所属项目 id。
- `title`：存档标题。
- `savedAt`：保存时间。
- `previewText`：列表预览文本。
- `speakerName`：可选说话人。
- `backgroundAssetId`：保存时背景素材 id。
- `currentScriptId`：保存时脚本 id。
- `currentNodeId`：保存时节点 id。
- `state`：`VNRuntime.getState()` 返回的运行时状态。

存档只保存运行时状态和预览信息，不保存完整 `VNProject`，也不保存图片、音频二进制。当前默认 demo 项目不变；后续正式项目可扩展项目 id、版本和兼容性校验。

## Web 导出包格式

命令行导出的 Web 游戏目录结构：

```text
exported-game/
├─ index.html
├─ assets/
├─ game/
│  ├─ project.bundle.json
│  ├─ export-manifest.json
│  └─ README.md
└─ demo-assets/
```

`game/project.bundle.json` 使用标准 `ProjectBundle`。播放器启动时优先请求 `/game/project.bundle.json`，如果请求失败、JSON 解析失败或项目校验失败，则回退到内置 demo 项目。

`game/export-manifest.json` 使用 `WebExportManifest`：

```json
{
  "exportFormat": "vn-engine-web-export",
  "exportVersion": "0.1.0",
  "exportedAt": "2026-05-14T00:00:00.000Z",
  "projectId": "demo-game",
  "projectName": "林澄的测试故事",
  "projectBundlePath": "game/project.bundle.json",
  "assetRefs": [],
  "warnings": []
}
```

素材路径规则：

- `/demo-assets/audio/bgm-demo.wav` 会规范化为 `demo-assets/audio/bgm-demo.wav`。
- `assets/audio/bgm/main.mp3` 作为普通相对路径保留。
- `../secret.txt`、`C:\\Users\\xxx\\secret.mp3`、`/etc/passwd` 这类危险路径会阻止导出。
- 素材二进制不会写入 JSON，也不会转成 base64。

## Web Demo 素材路径

当前还没有接 Tauri 文件系统，播放器 demo 的可访问素材放在：

```text
apps/player/public/demo-assets/
```

项目资源路径统一写成浏览器可访问路径：

```text
/demo-assets/audio/bgm-demo.wav
/demo-assets/audio/sound-click.wav
/demo-assets/audio/voice-lincheng-001.wav
/demo-assets/background/classroom.png
/demo-assets/character/lincheng/normal.png
```

demo 音频由 `scripts/generate-demo-audio.mjs` 生成：

```bash
pnpm generate:demo-audio
```

这些音频只用于技术验证。后续替换真实素材时，应通过编辑器或 Tauri 阶段的素材导入流程复制文件并更新资源路径。

## 角色与表情

`characters` 存放角色数据：

- `id`：角色唯一 id。
- `name`：角色名称。
- `displayName`：运行时显示名称。
- `description`：角色说明。
- `expressions`：角色表情列表。

表情字段：

- `id`：表情 id。
- `name`：表情名称。
- `assetId`：表情对应的角色图片素材 id。

## 脚本文件

`scripts/*.vn.json` 表示单个结构化剧本文件。每个脚本包含：

- `id`：脚本唯一标识。
- `name`：脚本显示名称。
- `nodes`：剧情节点数组。

## StoryNode 字段

- `dialogue`：角色对话，包含 `id`、`characterId`、`text`。
- `narration`：旁白，包含 `id`、`text`。
- `choice`：选项，包含 `id`、`prompt`、`options`。
- `scene`：背景切换，包含 `id`、`backgroundAssetId`。
- `showCharacter`：角色登场，包含 `id`、`characterId`、`assetId`、`expression`、`position`。
- `hideCharacter`：角色隐藏，包含 `id`、`characterId`。
- `playAudio`：播放音频，包含 `id`、`channel`、`assetId`、`loop`。
- `stopAudio`：停止音频，包含 `id`、`channel`。
- `setVariable`：设置变量，包含 `id`、`name`、`value`。
- `condition`：条件跳转，包含 `id`、`branches`、`fallbackTarget`。
- `jump`：直接跳转，包含 `id`、`target`。

`playAudio.channel` 和 `stopAudio.channel` 推荐使用 `bgm`、`sound`、`voice`。`sfx` 仅作为旧数据兼容别名保留。

## 引用规则

`jump.target`、`choice.options[].target`、`condition.branches[].target` 和 `condition.fallbackTarget` 都使用 `{ "scriptId": "...", "nodeId": "..." }` 指向目标节点。

资源引用规则：

- `SceneNode.backgroundAssetId` 必须引用存在的 `background` 素材。
- `ShowCharacterNode.characterId` 必须引用存在的角色。
- `ShowCharacterNode.expression` 必须引用该角色已有表情。
- 角色表情的 `assetId` 必须引用存在的素材。
- `PlayAudioNode.assetId` 必须引用 `bgm`、`sound`、`sfx` 或 `voice` 素材。
- 素材 id、角色 id、脚本 id 和节点 id 不能重复。

## 未来 Tauri 素材目录

未来接 Tauri 后，真实工程目录建议采用：

```text
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
   └─ video/
```

Tauri 阶段负责选择本地素材、复制到工程 `assets` 目录、生成相对路径、更新项目资源元数据，并在导出游戏包时复制依赖素材。
## 演出字段

`SceneNode` 可选字段：`transition`、`transitionDurationMs`，用于描述背景转场。支持 `none`、`fade`、`slideLeft`、`slideRight`。

`ShowCharacterNode` 可选字段：`enterEffect`、`transitionDurationMs`、`position`、`x`、`y`、`scale`、`opacity`、`zIndex`、`flipX`。`position` 支持 `left`、`center`、`right`、`custom`；`custom` 位置建议同时填写 `x` 和 `y`。

`HideCharacterNode` 可选字段：`exitEffect`、`transitionDurationMs`。支持 `none`、`fadeOut`、`slideOutLeft`、`slideOutRight`。

`CameraNode` 是自动节点，字段包括 `zoom`、`offsetX`、`offsetY`、`shake`、`shakeIntensity`、`durationMs`。它只描述基础镜头状态，不表示关键帧或复杂时间轴。

`DialogueNode` 和 `NarrationNode` 可选字段：`textSpeed`、`autoNext`、`waitForClick`。当前播放器保留这些字段供运行时 UI 使用，未实现复杂打字机系统。

## 剧情逻辑字段

`VNProject.variables` 定义项目级变量，字段包括 `name`、`type`、`defaultValue` 和可选 `description`。变量类型支持 `boolean`、`number`、`string`，运行时值不写回变量定义。

`SetVariableNode` 支持 `variableName`、`operator` 和 `value`。`operator` 可为 `set`、`add`、`subtract`；`add/subtract` 只用于 number 变量。旧字段 `name` 仍作为兼容变量名读取。

`ConditionNode` 支持结构化 `condition`，表达式类型包括 `variable`、`and`、`or`、`not`。变量条件支持 `eq`、`ne`、`gt`、`gte`、`lt`、`lte`、`contains`、`notContains`，不使用字符串脚本或 `eval`。

`LabelNode` 字段包括 `id`、`type: "label"`、`name` 和可选 `description`。标签节点是自动节点，不显示在玩家画面中。

`NodeTarget` 现在支持 `{ scriptId, nodeId }` 或 `{ scriptId, label }`。`JumpNode`、`ChoiceOption`、`ConditionNode.trueTarget` 和 `ConditionNode.falseTarget` 都可以指向节点或标签。
## ActionSequenceNode 与 VNAction

`ActionSequenceNode` 用于在一个剧情节点中描述一段结构化演出：

```json
{
  "id": "action-sequence-intro",
  "type": "actionSequence",
  "name": "intro-presentation",
  "waitForCompletion": true,
  "autoNext": true,
  "actions": [
    { "id": "a1", "type": "wait", "durationMs": 500 },
    { "id": "a2", "type": "scene", "backgroundAssetId": "bg-classroom", "transition": "fade", "durationMs": 300 },
    { "id": "a3", "type": "parallel", "actions": [
      { "id": "a3-1", "type": "moveCharacter", "characterId": "lincheng", "position": "center", "durationMs": 500 },
      { "id": "a3-2", "type": "camera", "zoom": 1.05, "durationMs": 500 }
    ] }
  ]
}
```

动作类型包括 `wait`、`scene`、`showCharacter`、`hideCharacter`、`moveCharacter`、`changeExpression`、`camera`、`playAudio`、`stopAudio` 和 `parallel`。动作只保存结构化 JSON 字段，不使用自定义脚本语言，不保存图片或音频二进制。`waitForCompletion=true` 时播放器等待渲染器通知完成后再继续。
