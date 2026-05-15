import { shallowRef } from "vue";
import { PixiVNRenderer } from "@vn-engine/vn-renderer-pixi";
import type { PixiVNRenderOptions } from "@vn-engine/vn-renderer-pixi";
import type { RuntimeSnapshot } from "@vn-engine/vn-core";
import type { VNProject } from "@vn-engine/vn-schema";

/** 创建并管理 PixiJS 视觉小说渲染器。 */
export function usePixiVNRenderer(onChoose: (optionId: string) => void, onActionSequenceComplete?: () => void, onAnimationComplete?: () => void) {
  /** 当前渲染器实例。 */
  const renderer = shallowRef<PixiVNRenderer | null>(null);

  /** 挂载渲染器。 */
  async function mount(container: HTMLElement): Promise<void> {
    renderer.value = new PixiVNRenderer({ onChoose, onActionSequenceComplete, onAnimationComplete });
    await renderer.value.mount(container);
  }

  /** 渲染当前快照。 */
  async function render(snapshot: RuntimeSnapshot, project: VNProject, options?: PixiVNRenderOptions): Promise<void> {
    await renderer.value?.render(snapshot, project, options);
  }

  /** 调整渲染尺寸。 */
  function resize(width: number, height: number): void {
    renderer.value?.resize(width, height);
  }

  /** 销毁渲染器。 */
  function destroy(): void {
    renderer.value?.destroy();
    renderer.value = null;
  }

  return {
    renderer,
    mount,
    render,
    resize,
    destroy
  };
}
