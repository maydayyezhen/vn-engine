<script setup lang="ts">
import type { ValidationResult, VNProject } from "@vn-engine/vn-schema";
import type { EditorView } from "../stores/editorStore";

/** 组件属性。 */
defineProps<{
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
}>();

/** 组件事件触发器。 */
const emit = defineEmits<{
  /** 触发导入项目。 */
  importProject: [];
  /** 触发导出项目。 */
  exportProject: [];
  /** 重置为 demo 项目。 */
  resetDemo: [];
  /** 重新开始预览。 */
  restartPreview: [];
  /** 切换主视图。 */
  changeView: [view: EditorView];
}>();

/** 处理主视图切换。 */
function handleChangeView(value: string | number | boolean | undefined): void {
  if (value === "script" || value === "assets" || value === "characters") {
    emit("changeView", value);
  }
}
</script>

<template>
  <el-card class="toolbar-card" shadow="never">
    <div class="toolbar-content">
      <div class="toolbar-meta">
        <strong>{{ project.name }}</strong>
        <el-tag size="small" effect="dark" :type="dirty ? 'warning' : 'success'">
          {{ dirty ? "有未保存修改" : "无未保存修改" }}
        </el-tag>
        <el-tag size="small" effect="dark" :type="validationResult.valid ? 'success' : 'danger'">
          {{ validationResult.valid ? "校验通过" : `校验错误 ${validationResult.errors.length}` }}
        </el-tag>
        <span>脚本：{{ scriptId }}</span>
        <span>节点：{{ nodeId || "未选择" }}</span>
      </div>
      <div class="toolbar-actions">
        <el-radio-group :model-value="activeView" size="small" @update:model-value="handleChangeView">
          <el-radio-button value="script">剧本编辑</el-radio-button>
          <el-radio-button value="assets">素材库</el-radio-button>
          <el-radio-button value="characters">角色管理</el-radio-button>
        </el-radio-group>
        <el-button size="small" @click="$emit('importProject')">导入项目JSON</el-button>
        <el-button size="small" type="primary" @click="$emit('exportProject')">导出项目JSON</el-button>
        <el-button size="small" @click="$emit('resetDemo')">重置为demo项目</el-button>
        <el-button size="small" @click="$emit('restartPreview')">重新开始预览</el-button>
      </div>
    </div>
  </el-card>
</template>
