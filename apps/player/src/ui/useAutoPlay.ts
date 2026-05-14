import { onBeforeUnmount, ref, watch, type Ref } from "vue";
import type { RuntimeSnapshot } from "@vn-engine/vn-core";
import { AutoPlayController } from "@vn-engine/vn-ui-runtime";

/** 创建自动播放组合逻辑。 */
export function useAutoPlay(snapshot: Ref<RuntimeSnapshot>, delayMs: Ref<number>, onNext: () => void) {
  /** 自动播放控制器。 */
  const controller = new AutoPlayController({ delayMs: delayMs.value, onNext });
  /** 当前是否自动播放。 */
  const enabled = ref(false);

  /** 设置自动播放状态。 */
  function setEnabled(value: boolean): void {
    enabled.value = value;
    if (value) controller.start(snapshot.value);
    else controller.stop();
  }

  /** 重新根据当前快照安排自动播放。 */
  function reschedule(): void {
    controller.setDelay(delayMs.value);
    if (enabled.value) {
      controller.schedule(snapshot.value);
      if (!controller.isEnabled()) enabled.value = false;
    }
  }

  watch(snapshot, reschedule);
  watch(delayMs, reschedule);

  onBeforeUnmount(() => {
    controller.destroy();
  });

  return {
    enabled,
    setEnabled,
    reschedule
  };
}
