<script setup lang="ts">
import type { ValidationResult } from "@vn-engine/vn-schema";

/** 组件属性。 */
defineProps<{
  /** 当前工程校验结果。 */
  result: ValidationResult;
}>();
</script>

<template>
  <el-card class="validation-card" shadow="never">
    <template #header>校验结果</template>
    <el-alert v-if="result.valid" title="当前项目校验通过" type="success" :closable="false" show-icon />
    <div v-else class="validation-list">
      <el-alert
        v-for="issue in result.errors"
        :key="`${issue.scriptId || 'project'}:${issue.nodeId || issue.message}`"
        :title="issue.message"
        type="error"
        :closable="false"
        show-icon
      >
        <template #default>
          <span v-if="issue.scriptId">脚本：{{ issue.scriptId }}</span>
          <span v-if="issue.nodeId"> 节点：{{ issue.nodeId }}</span>
        </template>
      </el-alert>
    </div>
    <div v-if="result.warnings.length" class="validation-list">
      <el-alert
        v-for="issue in result.warnings"
        :key="`${issue.scriptId || 'project'}:${issue.nodeId || issue.message}:warning`"
        :title="issue.message"
        type="warning"
        :closable="false"
        show-icon
      />
    </div>
  </el-card>
</template>
