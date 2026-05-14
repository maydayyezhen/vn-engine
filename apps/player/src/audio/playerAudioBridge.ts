import type { AudioResolvedResource } from "@vn-engine/vn-audio";

/** 获取指定通道的资源显示名称。 */
export function getAudioDisplayName(resources: AudioResolvedResource[], channel: AudioResolvedResource["channel"]): string {
  const resource = resources.find((item) => item.channel === channel);
  if (!resource) return "未播放";
  return resource.ok ? `${resource.name} (${resource.assetId})` : `${resource.assetId ?? "未知资源"}：${resource.error}`;
}
