/** 创建传给 PixiJS 渲染器的选项点击回调。 */
export function createChoiceBridge(onChoose: (optionId: string) => void): (optionId: string) => void {
  return (optionId: string) => {
    onChoose(optionId);
  };
}
