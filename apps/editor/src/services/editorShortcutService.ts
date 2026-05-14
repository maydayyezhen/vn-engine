/** 编辑器快捷键处理器集合。 */
export interface EditorShortcutHandlers {
  /** 保存项目。 */
  save: () => void;
  /** 撤销。 */
  undo: () => void;
  /** 重做。 */
  redo: () => void;
  /** 复制节点。 */
  copy: () => void;
  /** 剪切节点。 */
  cut: () => void;
  /** 粘贴节点。 */
  paste: () => void;
  /** 删除节点。 */
  deleteNode: () => void;
  /** 聚焦搜索框。 */
  focusSearch: () => void;
}

/** 判断事件目标是否正在编辑文本。 */
function isTextEditingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || target.isContentEditable;
}

/** 创建编辑器快捷键监听函数。 */
export function createEditorShortcutHandler(handlers: EditorShortcutHandlers): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const editingText = isTextEditingTarget(event.target);

    if ((event.ctrlKey || event.metaKey) && key === "s") {
      event.preventDefault();
      handlers.save();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && key === "f") {
      event.preventDefault();
      handlers.focusSearch();
      return;
    }

    if (editingText) return;

    if ((event.ctrlKey || event.metaKey) && key === "z" && event.shiftKey) {
      event.preventDefault();
      handlers.redo();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && key === "z") {
      event.preventDefault();
      handlers.undo();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && key === "y") {
      event.preventDefault();
      handlers.redo();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && key === "c") {
      event.preventDefault();
      handlers.copy();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && key === "x") {
      event.preventDefault();
      handlers.cut();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && key === "v") {
      event.preventDefault();
      handlers.paste();
      return;
    }
    if (event.key === "Delete") {
      event.preventDefault();
      handlers.deleteNode();
    }
  };
}
