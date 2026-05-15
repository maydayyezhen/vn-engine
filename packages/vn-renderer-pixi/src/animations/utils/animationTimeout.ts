/** 等待指定毫秒，统一处理负值和非数字。 */
export function waitAnimation(ms: number): Promise<void> {
  const duration = Number.isFinite(ms) ? Math.max(0, ms) : 0;
  return new Promise((resolve) => setTimeout(resolve, duration));
}

/** 使用 requestAnimationFrame 执行简单补间。 */
export function tween(durationMs: number, update: (progress: number) => void): Promise<void> {
  const duration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;
  if (duration === 0) {
    update(1);
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      update(progress);
      if (progress < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}
