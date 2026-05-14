<script setup lang="ts">
import type { ValidationResult, VNProject } from "@vn-engine/vn-schema";

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
}>();

/** 组件事件。 */
defineEmits<{
  /** 触发导入项目。 */
  importProject: [];
  /** 触发导出项目。 */
  exportProject: [];
  /** 重置为 demo。 */
  resetDemo: [];
  /** 重新开始预览。 */
  restartPreview: [];
}>();
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
        <el-button size="small" @click="$emit('importProject')">导入项目JSON</el-button>
        <el-button size="small" type="primary" @click="$emit('exportProject')">导出项目JSON</el-button>
        <el-button size="small" @click="$emit('resetDemo')">重置为demo项目</el-button>
        <el-button size="small" @click="$emit('restartPreview')">重新开始预览</el-button>
      </div>
    </div>
  </el-card>
</template>
