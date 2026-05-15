<script setup lang="ts">
import { computed } from "vue";
import type { ValidationIssue, ValidationResult } from "@vn-engine/vn-schema";

/** 状态栏属性。 */
const props = defineProps<{
  /** 项目名称。 */
  projectName: string;
  /** 当前脚本 id。 */
  scriptId: string;
  /** 当前节点 id。 */
  nodeId: string | null;
  /** 是否有未保存修改。 */
  dirty: boolean;
  /** 当前校验结果。 */
  validationResult: ValidationResult;
  /** 是否处于桌面运行环境。 */
  desktopMode: boolean;
  /** 当前预览缩放比例。 */
  previewZoom: number;
}>();

/** 状态栏事件。 */
defineEmits<{
  /** 定位状态栏显示的校验问题。 */
  locateIssue: [issue: ValidationIssue];
}>();

/** 状态栏显示的第一条校验问题。 */
const primaryIssue = computed(() => props.validationResult.errors[0] ?? props.validationResult.warnings[0]);
</script>

<template>
  <div class="status-bar">
    <span>{{ projectName }}</span>
    <span>脚本: {{ scriptId }}</span>
    <span>节点: {{ nodeId || "未选择" }}</span>
    <span :class="{ warn: dirty }">{{ dirty ? "未保存" : "已保存" }}</span>
    <span :class="{ error: !validationResult.valid }">
      校验: {{ validationResult.valid ? "通过" : `${validationResult.errors.length} 错误` }}
      <template v-if="validationResult.warnings.length"> / {{ validationResult.warnings.length }} 警告</template>
    </span>
    <span>{{ desktopMode ? "桌面模式" : "Web模式" }}</span>
    <span>预览 {{ Math.round(previewZoom * 100) }}%</span>
    <button
      v-if="primaryIssue"
      class="status-issue-button"
      :class="{ error: primaryIssue.level === 'error' }"
      :title="primaryIssue.message"
      @click="$emit('locateIssue', primaryIssue)"
    >
      {{ primaryIssue.level === "error" ? "错误" : "警告" }}：{{ primaryIssue.message }}
    </button>
  </div>
</template>
