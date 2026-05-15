<script setup lang="ts">
import type { ValidationResult } from "@vn-engine/vn-schema";

/** 状态栏属性。 */
defineProps<{
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
  </div>
</template>
