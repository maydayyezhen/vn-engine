<script setup lang="ts">
import { computed } from "vue";
import type { VNProject } from "@vn-engine/vn-schema";

/** 项目树节点数据。 */
interface ProjectTreeNode {
  /** 节点唯一 key。 */
  key: string;
  /** 节点显示文本。 */
  label: string;
  /** 节点类型。 */
  kind: "project" | "group" | "script" | "character" | "asset";
  /** 关联脚本 id。 */
  scriptId?: string;
  /** 子节点。 */
  children?: ProjectTreeNode[];
}

/** 组件属性。 */
const props = defineProps<{
  /** 当前工程数据。 */
  project: VNProject;
  /** 当前选中的脚本 id。 */
  selectedScriptId: string;
}>();

/** 组件事件。 */
const emit = defineEmits<{
  /** 选择脚本。 */
  selectScript: [scriptId: string];
  /** 新建脚本。 */
  createScript: [];
  /** 重命名脚本。 */
  renameScript: [scriptId: string];
  /** 删除脚本。 */
  deleteScript: [scriptId: string];
  /** 设置入口脚本。 */
  setStartScript: [scriptId: string];
}>();

/** Element Plus 树节点数据。 */
const treeData = computed<ProjectTreeNode[]>(() => [
  {
    key: `project:${props.project.id}`,
    label: props.project.name,
    kind: "project",
    children: [
      {
        key: "group:scripts",
        label: "脚本",
        kind: "group",
        children: props.project.scripts.map((script) => ({
          key: `script:${script.id}`,
          label: `${script.name || script.id}${script.id === props.project.startScriptId ? " ★" : ""}`,
          kind: "script",
          scriptId: script.id
        }))
      },
      {
        key: "group:characters",
        label: "角色",
        kind: "group",
        children: props.project.characters.map((character) => ({
          key: `character:${character.id}`,
          label: character.name,
          kind: "character"
        }))
      },
      {
        key: "group:assets",
        label: "素材",
        kind: "group",
        children: props.project.assets.items.map((asset) => ({
          key: `asset:${asset.id}`,
          label: `${asset.name} (${asset.type})`,
          kind: "asset"
        }))
      }
    ]
  }
]);

/** 点击项目树节点。 */
function handleNodeClick(node: ProjectTreeNode): void {
  if (node.kind === "script" && node.scriptId) {
    emit("selectScript", node.scriptId);
  }
}
</script>

<template>
  <el-card class="panel-card" shadow="never">
    <template #header>
      <div class="panel-header">
        <span>项目资源</span>
        <el-button size="small" type="primary" @click="$emit('createScript')">新建脚本</el-button>
      </div>
    </template>
    <div class="script-manage-list">
      <div
        v-for="script in project.scripts"
        :key="script.id"
        class="script-manage-item"
        :class="{ active: script.id === selectedScriptId }"
        @click="$emit('selectScript', script.id)"
      >
        <div>
          <strong>{{ script.name || script.id }}</strong>
          <small>{{ script.id }}<span v-if="script.id === project.startScriptId"> · 入口</span></small>
        </div>
        <el-button-group @click.stop>
          <el-button size="small" @click="$emit('renameScript', script.id)">重命名</el-button>
          <el-button size="small" :disabled="script.id === project.startScriptId" @click="$emit('setStartScript', script.id)">设入口</el-button>
          <el-button size="small" type="danger" :disabled="project.scripts.length <= 1" @click="$emit('deleteScript', script.id)">删除</el-button>
        </el-button-group>
      </div>
    </div>
    <el-tree
      :data="treeData"
      node-key="key"
      default-expand-all
      :current-node-key="`script:${selectedScriptId}`"
      highlight-current
      @node-click="handleNodeClick"
    />
  </el-card>
</template>
