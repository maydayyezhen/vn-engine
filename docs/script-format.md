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

当前素材仍是路径元数据，不包含真实图片或音频文件管理。

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

## 引用规则

`jump.target`、`choice.options[].target`、`condition.branches[].target` 和 `condition.fallbackTarget` 都使用 `{ "scriptId": "...", "nodeId": "..." }` 指向目标节点。

资源引用规则：

- `SceneNode.backgroundAssetId` 必须引用存在的 `background` 素材。
- `ShowCharacterNode.characterId` 必须引用存在的角色。
- `ShowCharacterNode.expression` 必须引用该角色已有表情。
- 角色表情的 `assetId` 必须引用存在的素材。
- `PlayAudioNode.assetId` 必须引用 `bgm`、`sound`、`sfx` 或 `voice` 素材。
- 素材 id、角色 id、脚本 id 和节点 id 不能重复。

## 完整 JSON 示例

```json
{
  "id": "start",
  "name": "开场",
  "nodes": [
    {
      "id": "scene-classroom",
      "type": "scene",
      "backgroundAssetId": "bg-classroom"
    },
    {
      "id": "show-lincheng",
      "type": "showCharacter",
      "characterId": "lincheng",
      "assetId": "lincheng-normal",
      "expression": "normal",
      "position": "center"
    },
    {
      "id": "dialogue-greeting",
      "type": "dialogue",
      "characterId": "lincheng",
      "text": "你终于来了。"
    },
    {
      "id": "choice-stay-or-leave",
      "type": "choice",
      "prompt": "你要怎么做？",
      "options": [
        {
          "id": "stay",
          "text": "留下来听她说",
          "setVariables": { "stay": true },
          "target": { "scriptId": "start", "nodeId": "condition-stay" }
        }
      ]
    }
  ]
}
```
