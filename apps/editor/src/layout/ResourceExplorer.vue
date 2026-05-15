<script setup lang="ts">
import { computed } from "vue";
import type { VNProject } from "@vn-engine/vn-schema";
import { Box, Collection, Connection, DataLine, Document, Folder, Headset, Picture, User } from "@element-plus/icons-vue";
import type { EditorView } from "../stores/editorStore";

/** 资源管理器区段。 */
type ExplorerSection = "scripts" | "assets" | "characters" | "variables" | "animations" | "export";

/** 资源管理器属性。 */
const props = defineProps<{
  /** 当前项目。 */
  project: VNProject;
  /** 当前脚本 id。 */
  selectedScriptId: string;
  /** 当前主视图。 */
  activeView: EditorView;
  /** 搜索关键字。 */
  searchQuery: string;
}>();

/** 资源管理器事件。 */
const emit = defineEmits<{
  /** 更新搜索关键字。 */
  updateSearchQuery: [value: string];
  /** 切换主视图。 */
  changeView: [view: EditorView];
  /** 打开动画模块区。 */
  openAnimations: [];
  /** 选择脚本。 */
  selectScript: [scriptId: string];
  /** 新建脚本。 */
  createScript: [];
  /** 重命名脚本。 */
  renameScript: [scriptId: string];
  /** 删除脚本。 */
  deleteScript: [scriptId: string];
  /** 设为入口脚本。 */
  setStartScript: [scriptId: string];
}>();

/** 资源分类计数。 */
const assetCounts = computed(() => ({
  background: props.project.assets.items.filter((asset) => asset.type === "background").length,
  character: props.project.assets.items.filter((asset) => asset.type === "character").length,
  prop: props.project.assets.items.filter((asset) => asset.type === "prop").length,
  audio: props.project.assets.items.filter((asset) => ["bgm", "sound", "sfx", "voice"].includes(asset.type)).length,
  image: props.project.assets.items.filter((asset) => ["image", "other"].includes(asset.type)).length
}));

/** 搜索后的脚本列表。 */
const filteredScripts = computed(() => {
  const query = props.searchQuery.trim().toLowerCase();
  if (!query) return props.project.scripts;
  return props.project.scripts.filter((script) => `${script.id} ${script.name ?? ""}`.toLowerCase().includes(query));
});

/** 打开资源管理器区段。 */
function openSection(section: ExplorerSection): void {
  if (section === "scripts") emit("changeView", "script");
  if (section === "assets") emit("changeView", "assets");
  if (section === "characters") emit("changeView", "characters");
  if (section === "variables") emit("changeView", "variables");
  if (section === "export") emit("changeView", "export");
  if (section === "animations") emit("openAnimations");
}
</script>

<template>
  <section class="resource-explorer">
    <div class="resource-tree-pane">
      <div class="panel-title-row">
        <strong>资源管理器</strong>
        <el-button size="small" text @click="$emit('createScript')">新脚本</el-button>
      </div>
      <el-input
        :model-value="searchQuery"
        class="resource-search"
        size="small"
        clearable
        placeholder="搜索脚本或资源"
        @update:model-value="$emit('updateSearchQuery', String($event))"
      />

      <div class="resource-section">
        <button class="resource-section-title" :class="{ active: activeView === 'script' }" @click="openSection('scripts')">
          <span class="resource-title-label"><el-icon><Document /></el-icon>脚本</span>
          <span>{{ project.scripts.length }}</span>
        </button>
        <div class="script-list">
          <div
            v-for="script in filteredScripts"
            :key="script.id"
            class="script-tree-row"
            :class="{ active: script.id === selectedScriptId }"
            @click="$emit('selectScript', script.id)"
          >
            <div class="script-tree-main">
              <strong>{{ script.name || script.id }}</strong>
              <small>{{ script.id }}<span v-if="script.id === project.startScriptId"> · 入口</span></small>
            </div>
            <el-dropdown trigger="click" @click.stop>
              <button class="row-menu-button">...</button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$emit('renameScript', script.id)">重命名</el-dropdown-item>
                  <el-dropdown-item :disabled="script.id === project.startScriptId" @click="$emit('setStartScript', script.id)">设为入口</el-dropdown-item>
                  <el-dropdown-item :disabled="project.scripts.length <= 1" divided @click="$emit('deleteScript', script.id)">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>

      <div class="resource-section">
        <button class="resource-section-title" :class="{ active: activeView === 'assets' }" @click="openSection('assets')">
          <span class="resource-title-label"><el-icon><Folder /></el-icon>素材库</span>
          <span>{{ project.assets.items.length }}</span>
        </button>
        <div class="resource-category-grid">
          <button @click="openSection('assets')"><span class="resource-title-label"><el-icon><Picture /></el-icon>背景</span><span>{{ assetCounts.background }}</span></button>
          <button @click="openSection('assets')"><span class="resource-title-label"><el-icon><Collection /></el-icon>CG/图片</span><span>{{ assetCounts.image }}</span></button>
          <button @click="openSection('assets')"><span class="resource-title-label"><el-icon><Headset /></el-icon>音乐/音效</span><span>{{ assetCounts.audio }}</span></button>
          <button @click="openSection('assets')"><span class="resource-title-label"><el-icon><Box /></el-icon>物品</span><span>{{ assetCounts.prop }}</span></button>
        </div>
      </div>

      <div class="resource-section">
        <button class="resource-section-title" :class="{ active: activeView === 'characters' }" @click="openSection('characters')">
          <span class="resource-title-label"><el-icon><User /></el-icon>角色</span>
          <span>{{ project.characters.length }}</span>
        </button>
        <button class="resource-section-title" :class="{ active: activeView === 'variables' }" @click="openSection('variables')">
          <span class="resource-title-label"><el-icon><DataLine /></el-icon>变量</span>
          <span>{{ project.variables?.length ?? 0 }}</span>
        </button>
        <button class="resource-section-title" @click="openSection('animations')">
          <span class="resource-title-label"><el-icon><Connection /></el-icon>动画模块</span>
        </button>
        <button class="resource-section-title" :class="{ active: activeView === 'export' }" @click="openSection('export')">
          <span class="resource-title-label"><el-icon><Folder /></el-icon>导出 / 构建</span>
        </button>
      </div>
    </div>

    <div class="resource-preview-pane">
      <slot name="preview" />
    </div>
  </section>
</template>
