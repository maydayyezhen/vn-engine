<script setup lang="ts">
import { computed } from "vue";
import { ElMessage } from "element-plus";
import type { VNProject } from "@vn-engine/vn-schema";
import { createWebExportSummary, downloadWebProjectBundle } from "../services/webExportService";

/** 组件属性。 */
const props = defineProps<{
  /** 当前工程数据。 */
  project: VNProject;
}>();

/** Web 导出检查摘要。 */
const summary = computed(() => createWebExportSummary(props.project));

/** 下载当前项目的 ProjectBundle。 */
function handleDownloadBundle(): void {
  if (!summary.value.canExport) {
    ElMessage.error("当前项目存在导出错误，请先修复后再导出。");
    return;
  }
  downloadWebProjectBundle(props.project);
  ElMessage.success("已导出 project.bundle.json。");
}
</script>

<template>
  <section class="web-export-panel">
    <el-card shadow="never">
      <template #header>
        <div class="panel-header-row">
          <strong>Web游戏导出</strong>
          <el-button type="primary" :disabled="!summary.canExport" @click="handleDownloadBundle">导出ProjectBundle JSON</el-button>
        </div>
      </template>

      <el-alert
        title="当前Web编辑器只导出项目包JSON并做导出校验；完整复制素材、选择导出目录和生成完整静态游戏包将在Tauri阶段实现。命令行可使用 pnpm export:demo-web 验证demo完整Web导出。"
        type="info"
        :closable="false"
        show-icon
      />

      <el-alert
        v-if="!summary.canExport"
        class="export-alert"
        title="存在导出错误，已阻止导出。"
        type="error"
        :closable="false"
        show-icon
      />
      <el-alert
        v-else-if="summary.warnings.length"
        class="export-alert"
        title="存在导出警告，可以继续导出ProjectBundle。"
        type="warning"
        :closable="false"
        show-icon
      />
      <el-alert v-else class="export-alert" title="当前项目导出校验通过。" type="success" :closable="false" show-icon />

      <el-descriptions class="export-meta" :column="2" border>
        <el-descriptions-item label="项目ID">{{ summary.manifest.projectId }}</el-descriptions-item>
        <el-descriptions-item label="项目名称">{{ summary.manifest.projectName }}</el-descriptions-item>
        <el-descriptions-item label="项目包路径">{{ summary.manifest.projectBundlePath }}</el-descriptions-item>
        <el-descriptions-item label="素材数量">{{ summary.assetRefs.length }}</el-descriptions-item>
      </el-descriptions>

      <h3>导出错误</h3>
      <el-empty v-if="!summary.errors.length" description="没有导出错误" />
      <el-alert v-for="error in summary.errors" v-else :key="error" class="export-alert" :title="error" type="error" :closable="false" />

      <h3>导出警告</h3>
      <el-empty v-if="!summary.warnings.length" description="没有导出警告" />
      <el-alert v-for="warning in summary.warnings" v-else :key="warning" class="export-alert" :title="warning" type="warning" :closable="false" />

      <h3>素材引用</h3>
      <el-table :data="summary.assetRefs" border>
        <el-table-column prop="assetId" label="素材ID" min-width="140" />
        <el-table-column prop="assetType" label="类型" width="100" />
        <el-table-column prop="sourcePath" label="当前路径" min-width="220" />
        <el-table-column prop="exportPath" label="导出路径" min-width="220">
          <template #default="{ row }">
            <span>{{ row.exportPath || "不可导出" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="demo素材" width="100">
          <template #default="{ row }">
            <el-tag :type="row.existsInDemoPublic ? 'success' : 'info'" size="small">
              {{ row.existsInDemoPublic ? "是" : "否" }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <h3>导出包结构</h3>
      <pre class="export-structure">exported-game/
├─ index.html
├─ assets/
├─ game/
│  ├─ project.bundle.json
│  └─ export-manifest.json
└─ demo-assets/</pre>
    </el-card>
  </section>
</template>
