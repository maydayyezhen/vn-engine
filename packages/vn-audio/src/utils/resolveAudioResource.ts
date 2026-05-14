import type { VNProject } from "@vn-engine/vn-schema";
import type { AudioChannel } from "../AudioChannel";
import type { AudioResolvedResource } from "../types";

/** 允许作为指定音频通道播放的素材类型。 */
const allowedTypes: Record<AudioChannel, string[]> = {
  bgm: ["bgm"],
  sound: ["sound", "sfx"],
  voice: ["voice"]
};

/** 从工程素材库中解析音频资源。 */
export function resolveAudioResource(project: VNProject, channel: AudioChannel, assetId: string | undefined): AudioResolvedResource {
  if (!assetId) {
    return {
      channel,
      assetId,
      name: "未设置",
      ok: false,
      error: `音频通道 ${channel} 没有资源 id。`
    };
  }

  const asset = project.assets.items.find((item) => item.id === assetId);
  if (!asset) {
    return {
      channel,
      assetId,
      name: assetId,
      ok: false,
      error: `音频资源不存在：${assetId}`
    };
  }

  if (!allowedTypes[channel].includes(asset.type)) {
    return {
      channel,
      assetId,
      name: asset.name,
      path: asset.path,
      asset,
      ok: false,
      error: `资源 ${assetId} 类型为 ${asset.type}，不能用于 ${channel} 通道。`
    };
  }

  return {
    channel,
    assetId,
    name: asset.name,
    path: asset.path,
    asset,
    ok: true
  };
}
