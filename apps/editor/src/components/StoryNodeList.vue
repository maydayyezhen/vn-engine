<script setup lang="ts">
import type { StoryNode } from "@vn-engine/vn-schema";
import { getNodeSummary } from "../services/scriptEditService";
import type { NodeFilterType } from "../services/nodeSearchService";

/** 组件属性。 */
const props = defineProps<{
  /** 剧情节点列表。 */
  nodes: StoryNode[];
  /** 当前选中的节点 id。 */
  selectedNodeId: string | null;
  /** 搜索关键字。 */
  searchQuery: string;
  /** 当前节点类型筛选。 */
  filterType: NodeFilterType;
  /** 是否可以撤销。 */
  canUndo: boolean;
  /** 是否可以重做。 */
  canRedo: boolean;
  /** 是否存在可粘贴节点。 */
  canPaste: boolean;
  /** 当前节点是否可以上移。 */
  canMoveUp: boolean;
  /** 当前节点是否可以下移。 */
  canMoveDown: boolean;
}>();

/** 组件事件。 */
const emit = defineEmits<{
  /** 选择节点。 */
  selectNode: [nodeId: string];
  /** 新增对话节点。 */
  addDialogue: [];
  /** 新增旁白节点。 */
  addNarration: [];
  /** 新增镜头节点。 */
  addCamera: [];
  /** 新增动作序列节点。 */
  addActionSequence: [];
  /** 新增代码型动画节点。 */
  addPlayAnimation: [];
  /** 新增物品显示节点。 */
  addShowProp: [];
  /** 新增物品隐藏节点。 */
  addHideProp: [];
  /** 新增标签节点。 */
  addLabel: [];
  /** 复制节点。 */
  duplicateNode: [];
  /** 删除节点。 */
  deleteNode: [];
  /** 剪切节点。 */
  cutNode: [];
  /** 粘贴节点。 */
  pasteNode: [];
  /** 上移节点。 */
  moveNodeUp: [];
  /** 下移节点。 */
  moveNodeDown: [];
  /** 撤销。 */
  undo: [];
  /** 重做。 */
  redo: [];
  /** 更新搜索关键字。 */
  updateSearchQuery: [value: string];
  /** 更新类型筛选。 */
  updateFilterType: [value: NodeFilterType];
}>();

/** 新增节点命令。 */
type AddNodeCommand = "dialogue" | "narration" | "camera" | "actionSequence" | "playAnimation" | "showProp" | "hideProp" | "label";

/** 返回节点行样式名。 */
function getRowClassName({ row }: { row: StoryNode }): string {
  return row.id === props.selectedNodeId ? "selected-node-row" : "";
}

/** 点击节点行。 */
function handleRowClick(row: StoryNode): void {
  emit("selectNode", row.id);
}

/** 处理新增节点下拉命令。 */
function handleAddNodeCommand(command: string | number | object): void {
  const value = command as AddNodeCommand;
  if (value === "dialogue") emit("addDialogue");
  if (value === "narration") emit("addNarration");
  if (value === "camera") emit("addCamera");
  if (value === "actionSequence") emit("addActionSequence");
  if (value === "playAnimation") emit("addPlayAnimation");
  if (value === "showProp") emit("addShowProp");
  if (value === "hideProp") emit("addHideProp");
  if (value === "label") emit("addLabel");
}
</script>

<template>
  <el-card class="panel-card story-node-list-card" shadow="never">
    <template #header>
      <div class="panel-header story-node-header">
        <span>脚本指令表</span>
        <div class="node-toolbar">
          <el-button-group>
            <el-button size="small" :disabled="!canUndo" @click="$emit('undo')">撤销</el-button>
            <el-button size="small" :disabled="!canRedo" @click="$emit('redo')">重做</el-button>
          </el-button-group>
          <el-dropdown trigger="click" @command="handleAddNodeCommand">
            <el-button size="small" type="primary">新增节点</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="dialogue">对话</el-dropdown-item>
                <el-dropdown-item command="narration">旁白</el-dropdown-item>
                <el-dropdown-item command="camera">镜头</el-dropdown-item>
                <el-dropdown-item command="actionSequence">动作序列</el-dropdown-item>
                <el-dropdown-item command="playAnimation">代码动画</el-dropdown-item>
                <el-dropdown-item command="showProp">显示物品</el-dropdown-item>
                <el-dropdown-item command="hideProp">隐藏物品</el-dropdown-item>
                <el-dropdown-item command="label">标签</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button-group>
            <el-button size="small" :disabled="!selectedNodeId" @click="$emit('duplicateNode')">复制</el-button>
            <el-button size="small" :disabled="!selectedNodeId" @click="$emit('cutNode')">剪切</el-button>
            <el-button size="small" :disabled="!canPaste" @click="$emit('pasteNode')">粘贴</el-button>
            <el-button size="small" :disabled="!canMoveUp" @click="$emit('moveNodeUp')">上移</el-button>
            <el-button size="small" :disabled="!canMoveDown" @click="$emit('moveNodeDown')">下移</el-button>
            <el-button size="small" type="danger" :disabled="!selectedNodeId" @click="$emit('deleteNode')">删除</el-button>
          </el-button-group>
        </div>
      </div>
      <div class="node-filter-bar">
        <el-input
          id="node-search-input"
          :model-value="searchQuery"
          size="small"
          clearable
          placeholder="搜索文本、节点 id、角色或选项"
          @update:model-value="$emit('updateSearchQuery', String($event))"
        />
        <el-select :model-value="filterType" size="small" @update:model-value="$emit('updateFilterType', $event as NodeFilterType)">
          <el-option label="全部" value="all" />
          <el-option label="对话" value="dialogue" />
          <el-option label="旁白" value="narration" />
          <el-option label="选项" value="choice" />
          <el-option label="场景" value="scene" />
          <el-option label="镜头" value="camera" />
          <el-option label="动作序列" value="actionSequence" />
          <el-option label="代码动画" value="playAnimation" />
          <el-option label="标签" value="label" />
          <el-option label="角色" value="character" />
          <el-option label="物品" value="prop" />
          <el-option label="音频" value="audio" />
          <el-option label="变量" value="variable" />
          <el-option label="条件" value="condition" />
          <el-option label="跳转" value="jump" />
        </el-select>
      </div>
    </template>
    <el-table
      :data="nodes"
      height="100%"
      highlight-current-row
      :row-class-name="getRowClassName"
      @row-click="handleRowClick"
    >
      <el-table-column label="#" width="60">
        <template #default="{ $index }">{{ $index + 1 }}</template>
      </el-table-column>
      <el-table-column prop="type" label="指令" width="140" />
      <el-table-column prop="id" label="节点 id" min-width="190" />
      <el-table-column label="内容摘要" min-width="260">
        <template #default="{ row }">
          {{ getNodeSummary(row) }}
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
