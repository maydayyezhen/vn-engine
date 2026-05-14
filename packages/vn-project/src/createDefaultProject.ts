import type { VNProject } from "@vn-engine/vn-schema";

/** 创建默认项目的输入参数。 */
export interface CreateDefaultProjectOptions {
  /** 工程 id，未传入时使用 default-project。 */
  id?: string;
  /** 工程名称，未传入时使用“新视觉小说工程”。 */
  name?: string;
}

/** 创建一个可直接通过基础校验的本地工程初始数据。 */
export function createDefaultProject(options: CreateDefaultProjectOptions = {}): VNProject {
  const projectId = options.id?.trim() || "default-project";
  return {
    id: projectId,
    name: options.name?.trim() || "新视觉小说工程",
    version: "0.1.0",
    startScriptId: "start",
    assets: {
      items: []
    },
    characters: [],
    scripts: [
      {
        id: "start",
        name: "开始",
        nodes: [
          {
            type: "narration",
            id: "start_intro",
            text: "这是一个新的视觉小说工程。"
          }
        ]
      }
    ]
  };
}
