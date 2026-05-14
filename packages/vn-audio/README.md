# @vn-engine/vn-audio

该包负责浏览器端音频播放控制，不依赖 Vue、Element Plus、PixiJS 或 Tauri。它只根据 `RuntimeSnapshot` 中的音频状态和 `VNProject` 中的资源元数据同步播放，不解释 `StoryNode`，也不持有 `VNRuntime`。

当前能力：

- `AudioManager`：基于 `HTMLAudioElement` 播放和停止音频。
- `play(options)`：播放指定通道资源。
- `stop(channel)`：停止指定通道。
- `stopAll()`：停止全部通道。
- `setMasterVolume(volume)`：设置主音量。
- `setVolume(channel, volume)`：设置通道音量。
- `setMuted(muted)`：设置静音。
- `resolveAudioResource(project, channel, assetId)`：解析音频资源。
- `resolveAudioState(snapshot, project)`：从快照解析当前音频状态。
- `syncAudioState(snapshot, project, audioManager)`：把快照音频状态同步到播放器。

通道：

- `bgm`：背景音乐，默认循环。
- `sound`：音效，默认播放一次。
- `voice`：语音，默认播放一次。

音频加载或播放失败时会返回错误信息，不会阻断剧情推进。当前没有复杂淡入淡出、混音、时间轴或真实工程文件系统。
