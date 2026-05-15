import type { RuntimeSnapshot } from "@vn-engine/vn-core";
import type { VNProject } from "@vn-engine/vn-schema";
import { AudioManager } from "./AudioManager";
import type { AudioChannel } from "./AudioChannel";
import type { AudioPlaybackError, AudioResolvedResource, AudioStateSyncResult } from "./types";
import { resolveAudioResource } from "./utils/resolveAudioResource";

/** 标准音频通道列表。 */
const channels: AudioChannel[] = ["bgm", "sound", "voice"];

/** 从运行时快照解析当前音频状态。 */
export function resolveAudioState(snapshot: RuntimeSnapshot, project: VNProject): AudioResolvedResource[] {
  return channels
    .map((channel) => {
      const assetId = channel === "sound" ? snapshot.audio.sound ?? snapshot.audio.sfx : snapshot.audio[channel];
      return resolveAudioResource(project, channel, assetId);
    })
    .filter((resource) => Boolean(resource.assetId));
}

/** 将运行时快照中的音频状态同步到音频管理器。 */
export async function syncAudioState(snapshot: RuntimeSnapshot, project: VNProject, audioManager: AudioManager): Promise<AudioStateSyncResult> {
  const resources = resolveAudioState(snapshot, project);
  const errors: AudioPlaybackError[] = [];

  for (const channel of channels) {
    const resource = resources.find((item) => item.channel === channel);
    if (!resource) {
      audioManager.stop(channel);
      continue;
    }

    if (!resource.ok || !resource.path || !resource.assetId) {
      errors.push({ channel, assetId: resource.assetId, message: resource.error ?? "音频资源不可用。" });
      audioManager.stop(channel);
      continue;
    }

    if (audioManager.getCurrentAssetId(channel) === resource.assetId) {
      continue;
    }

    try {
      await audioManager.play({
        channel,
        assetId: resource.assetId,
        path: resource.path,
        loop: channel === "bgm"
      });
    } catch (error) {
      errors.push({
        channel,
        assetId: resource.assetId,
        message: error instanceof Error ? error.message : "音频播放失败。"
      });
    }
  }

  return { resources, errors };
}
