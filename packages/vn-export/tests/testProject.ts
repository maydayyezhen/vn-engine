import type { VNProject } from "@vn-engine/vn-schema";

/** 创建带多类型素材的测试项目。 */
export function createExportTestProject(): VNProject {
  return {
    id: "export-test",
    name: "导出测试",
    version: "0.1.0",
    startScriptId: "start",
    assets: {
      items: [
        { id: "bg-classroom", name: "教室", type: "background", path: "/demo-assets/background/classroom.png" },
        { id: "lincheng-normal", name: "林澄普通", type: "character", path: "/demo-assets/character/lincheng/normal.png" },
        { id: "bgm-main", name: "BGM", type: "bgm", path: "/demo-assets/audio/bgm-demo.wav" },
        { id: "sound-click", name: "点击", type: "sound", path: "/demo-assets/audio/sound-click.wav" },
        { id: "voice-1", name: "语音", type: "voice", path: "/demo-assets/audio/voice-lincheng-001.wav" }
      ]
    },
    characters: [
      {
        id: "lincheng",
        name: "林澄",
        expressions: [{ id: "normal", name: "普通", assetId: "lincheng-normal" }]
      }
    ],
    scripts: [
      {
        id: "start",
        name: "开始",
        nodes: [
          { id: "scene", type: "scene", backgroundAssetId: "bg-classroom" },
          { id: "show", type: "showCharacter", characterId: "lincheng", expression: "normal", assetId: "lincheng-normal", position: "center" },
          { id: "bgm", type: "playAudio", channel: "bgm", assetId: "bgm-main", loop: true },
          { id: "sound", type: "playAudio", channel: "sound", assetId: "sound-click" },
          { id: "voice", type: "playAudio", channel: "voice", assetId: "voice-1" },
          { id: "text", type: "narration", text: "测试。" }
        ]
      }
    ]
  };
}
