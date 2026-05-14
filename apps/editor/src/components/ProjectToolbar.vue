<script setup lang="ts">
import { computed } from "vue";
import type { ValidationResult, VNProject } from "@vn-engine/vn-schema";
import type { EditorView } from "../stores/editorStore";

/** 顶部工具栏组件属性。 */
const props = defineProps<{
  /** 当前工程数据。 */
  project: VNProject;
  /** 当前脚本 id。 */
  scriptId: string;
  /** 当前节点 id。 */
  nodeId: string | null;
  /** 是否存在未保存修改。 */
  dirty: boolean;
  /** 当前校验结果。 */
  validationResult: ValidationResult;
  /** 当前主视图。 */
  activeView: EditorView;
  /** 是否运行在 Tauri 桌面环境。 */
  desktopMode: boolean;
  /** 当前桌面工程根目录，仅用于 UI 展示。 */
  desktopRoot: string | null;
}>();

/** 工具栏下拉命令。 */
type ToolbarCommand =
  | "importProject"
  | "exportProject"
  | "resetDemo"
  | "createDesktopProject"
  | "openDesktopProject"
  | "saveDesktopProject"
  | "exportDesktopWebGame";

/** 顶部工具栏事件。 */
const emit = defineEmits<{
  /** 触发导入项目 JSON。 */
  importProject: [];
  /** 触发导出项目 JSON。 */
  exportProject: [];
  /** 重置为 demo 项目。 */
  resetDemo: [];
  /** 重新开始预览。 */
  restartPreview: [];
  /** 新建桌面工程。 */
  createDesktopProject: [];
  /** 打开桌面工程。 */
  openDesktopProject: [];
  /** 保存桌面工程。 */
  saveDesktopProject: [];
  /** 导出桌面完整 Web 游戏包。 */
  exportDesktopWebGame: [];
  /** 切换主视图。 */
  changeView: [view: EditorView];
}>();

/** 当前工程目录展示文本。 */
const projectRootLabel = computed(() => props.desktopRoot || (props.desktopMode ? "未打开本地工程" : "Web模式不绑定本地目录"));

/** 处理主视图切换。 */
function handleChangeView(value: string | number | boolean | undefined): void {
  if (value === "script" || value === "assets" || value === "characters" || value === "export") {
    emit("changeView", value);
  }
}

/** 处理分组下拉命令。 */
function handleCommand(command: string | number | object): void {
  const value = command as ToolbarCommand;
  if (value === "importProject") emit("importProject");
  if (value === "exportProject") emit("exportProject");
  if (value === "resetDemo") emit("resetDemo");
  if (value === "createDesktopProject") emit("createDesktopProject");
  if (value === "openDesktopProject") emit("openDesktopProject");
  if (value === "saveDesktopProject") emit("saveDesktopProject");
  if (value === "exportDesktopWebGame") emit("exportDesktopWebGame");
}
</script>

<template>
  <el-card class="toolbar-card" shadow="never">
    <div class="toolbar-shell">
      <div class="toolbar-primary">
        <div class="project-summary">
          <strong class="project-name" :title="project.name">{{ project.name }}</strong>
          <div class="project-tags">
            <el-tag size="small" effect="dark" :type="dirty ? 'warning' : 'success'">
              {{ dirty ? "未保存" : "已保存" }}
            </el-tag>
            <el-tag size="small" effect="dark" :type="validationResult.valid ? 'success' : 'danger'">
              {{ validationResult.valid ? "校验通过" : `错误 ${validationResult.errors.length}` }}
            </el-tag>
            <el-tag size="small" :type="desktopMode ? 'success' : 'info'">
              {{ desktopMode ? "桌面" : "Web" }}
            </el-tag>
          </div>
        </div>

        <el-radio-group class="view-switcher" :model-value="activeView" size="small" @update:model-value="handleChangeView">
          <el-radio-button value="script">剧本</el-radio-button>
          <el-radio-button value="assets">素材</el-radio-button>
          <el-radio-button value="characters">角色</el-radio-button>
          <el-radio-button value="export">导出</el-radio-button>
        </el-radio-group>

        <div class="toolbar-command-groups">
          <el-button size="small" type="primary" :disabled="!desktopMode" @click="$emit('saveDesktopProject')">保存</el-button>
          <el-button size="small" @click="$emit('restartPreview')">重启预览</el-button>

          <el-dropdown trigger="click" @command="handleCommand">
            <el-button size="small">项目操作</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="importProject">导入项目 JSON</el-dropdown-item>
                <el-dropdown-item command="exportProject">导出项目 JSON</el-dropdown-item>
                <el-dropdown-item divided command="resetDemo">重置为 demo</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-dropdown trigger="click" @command="handleCommand">
            <el-button size="small">桌面工程</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :disabled="!desktopMode" command="createDesktopProject">新建本地工程</el-dropdown-item>
                <el-dropdown-item :disabled="!desktopMode" command="openDesktopProject">打开本地工程</el-dropdown-item>
                <el-dropdown-item :disabled="!desktopMode" command="saveDesktopProject">保存到本地工程</el-dropdown-item>
                <el-dropdown-item :disabled="!desktopMode" divided command="exportDesktopWebGame">导出完整 Web 包</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="toolbar-secondary">
        <span>脚本：{{ scriptId }}</span>
        <span>节点：{{ nodeId || "未选择" }}</span>
        <span class="project-root" :title="projectRootLabel">工程：{{ projectRootLabel }}</span>
      </div>
    </div>
  </el-card>
</template>
