# 剧本格式

## 工程文件

`project.vnproj.json` 是视觉小说工程入口文件，包含工程 id、名称、版本、起始脚本 id、素材库、角色列表和脚本列表。第一阶段示例中，播放器和编辑器会把 `scripts/*.vn.json` 加载后填入 `scripts` 字段。

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

导入时同时兼容 `ProjectBundle` 和裸 `VNProject`。`ProjectBundle.project` 必须是完整工程数据，包含 `scripts`、`characters`、`assets` 等字段。

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
- `showCharacter`：角色登场，包含 `id`、`characterId`、`assetId`、`position`。
- `hideCharacter`：角色隐藏，包含 `id`、`characterId`。
- `playAudio`：播放音频，包含 `id`、`channel`、`assetId`、`loop`。
- `stopAudio`：停止音频，包含 `id`、`channel`。
- `setVariable`：设置变量，包含 `id`、`name`、`value`。
- `condition`：条件跳转，包含 `id`、`branches`、`fallbackTarget`。
- `jump`：直接跳转，包含 `id`、`target`。

## 引用规则

`jump.target`、`choice.options[].target`、`condition.branches[].target` 和 `condition.fallbackTarget` 都使用 `{ "scriptId": "...", "nodeId": "..." }` 指向目标节点。

第一阶段校验规则要求：

- 项目 id 不能为空。
- `startScriptId` 必须存在。
- 脚本 id 不能重复。
- 同一工程内节点 id 不能重复。
- jump 目标必须存在。
- choice 选项跳转目标必须存在。
- condition 分支跳转目标必须存在。

## 完整示例

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
