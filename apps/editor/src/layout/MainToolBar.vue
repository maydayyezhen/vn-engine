<script setup lang="ts">
import type { ValidationResult, VNProject } from "@vn-engine/vn-schema";
import type { EditorView } from "../stores/editorStore";

/** 顶部工具栏属性。 */
const props = defineProps<{
  /** 当前项目。 */
  project: VNProject;
  /** 当前主视图。 */
  activeView: EditorView;
  /** 是否有未保存修改。 */
  dirty: boolean;
  /** 当前校验结果。 */
  validationResult: ValidationResult;
  /** 是否处于桌面运行环境。 */
  desktopMode: boolean;
  /** 当前本地工程目录。 */
  desktopRoot: string | null;
  /** 是否可以撤销。 */
  canUndo: boolean;
  /** 是否可以重做。 */
  canRedo: boolean;
}>();

/** 顶部工具栏事件。 */
defineEmits<{
  /** 切换主工作视图。 */
  changeView: [view: EditorView];
  /** 新建桌面工程。 */
  createDesktopProject: [];
  /** 打开桌面工程。 */
  openDesktopProject: [];
  /** 保存。 */
  save: [];
  /** 撤销。 */
  undo: [];
  /** 重做。 */
  redo: [];
  /** 聚焦查找。 */
  focusSearch: [];
  /** 重启预览。 */
  restartPreview: [];
  /** 导出完整 Web 包。 */
  exportDesktopWebGame: [];
}>();

/** 当前模式文本。 */
const modeLabel = props.desktopMode ? "桌面模式" : "Web模式";
</script>

<template>
  <div class="main-toolbar">
    <div class="toolbar-project">
      <strong class="toolbar-project-name" :title="project.name">{{ project.name }}</strong>
      <span class="toolbar-pill" :class="{ 'is-dirty': dirty }">{{ dirty ? "未保存" : "已保存" }}</span>
      <span class="toolbar-pill" :class="{ 'is-error': !validationResult.valid }">
        {{ validationResult.valid ? "校验通过" : `错误 ${validationResult.errors.length}` }}
      </span>
      <span class="toolbar-pill is-mode">{{ modeLabel }}</span>
    </div>

    <div class="toolbar-actions">
      <el-button size="small" :disabled="!desktopMode" @click="$emit('createDesktopProject')">新建</el-button>
      <el-button size="small" :disabled="!desktopMode" @click="$emit('openDesktopProject')">打开</el-button>
      <el-button size="small" type="primary" @click="$emit('save')">保存</el-button>
      <el-divider direction="vertical" />
      <el-button size="small" :disabled="!canUndo" @click="$emit('undo')">撤销</el-button>
      <el-button size="small" :disabled="!canRedo" @click="$emit('redo')">重做</el-button>
      <el-button size="small" @click="$emit('focusSearch')">查找</el-button>
      <el-divider direction="vertical" />
      <el-button size="small" type="success" @click="$emit('restartPreview')">预览</el-button>
      <el-button size="small" :disabled="!desktopMode" @click="$emit('exportDesktopWebGame')">构建游戏</el-button>
    </div>

    <div class="toolbar-switches">
      <button class="toolbar-tab" :class="{ active: activeView === 'script' }" @click="$emit('changeView', 'script')">剧本</button>
      <button class="toolbar-tab" :class="{ active: activeView === 'assets' }" @click="$emit('changeView', 'assets')">资源</button>
      <button class="toolbar-tab" :class="{ active: activeView === 'characters' }" @click="$emit('changeView', 'characters')">角色</button>
      <button class="toolbar-tab" :class="{ active: activeView === 'variables' }" @click="$emit('changeView', 'variables')">变量</button>
      <button class="toolbar-tab" :class="{ active: activeView === 'export' }" @click="$emit('changeView', 'export')">导出</button>
    </div>

    <span class="toolbar-root" :title="desktopRoot || 'Web模式不绑定本地目录'">
      {{ desktopRoot || "Web模式不绑定本地目录" }}
    </span>
  </div>
</template>
