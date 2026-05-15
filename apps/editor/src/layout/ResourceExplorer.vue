<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { AssetItem, VNProject } from "@vn-engine/vn-schema";
import { Box, Collection, Connection, DataLine, Document, Folder, Headset, Picture, User, VideoCamera } from "@element-plus/icons-vue";
import type { EditorView } from "../stores/editorStore";

/** 资源管理器可跳转区段。 */
type ExplorerSection = "scripts" | "assets" | "characters" | "variables" | "animations" | "export";

/** 资源树文件夹配置。 */
interface ResourceFolder {
  /** 文件夹唯一标识。 */
  key: string;
  /** 文件夹显示名称。 */
  label: string;
  /** 文件夹图标组件。 */
  icon: unknown;
  /** 点击文件夹时打开的工作区。 */
  section?: ExplorerSection;
  /** 文件夹内显示的项目。 */
  items?: ResourceTreeItem[];
  /** 文件夹是否默认展开。 */
  expanded?: boolean;
}

/** 资源树叶子项配置。 */
interface ResourceTreeItem {
  /** 叶子项唯一标识。 */
  id: string;
  /** 叶子项显示名称。 */
  label: string;
  /** 叶子项附加说明。 */
  subtitle?: string;
  /** 叶子项所属工作区。 */
  section: ExplorerSection;
  /** 脚本项对应的脚本 id。 */
  scriptId?: string;
}

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

/** 脚本右键菜单状态。 */
const scriptContextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  scriptId: ""
});

/** 默认展开的资源树分组。 */
const defaultExpandedFolderKeys = ["scripts", "characters", "backgrounds", "cg", "props"];

/** 当前手动展开的资源树分组。 */
const expandedFolderKeys = ref<string[]>([...defaultExpandedFolderKeys]);

/** 当前选中的资源树分组。 */
const selectedFolderKey = ref("scripts");

/** 标准化搜索文本。 */
const normalizedQuery = computed(() => props.searchQuery.trim().toLowerCase());

/** 是否匹配当前搜索。 */
function matchesQuery(...parts: Array<string | undefined>): boolean {
  if (!normalizedQuery.value) return true;
  return parts.join(" ").toLowerCase().includes(normalizedQuery.value);
}

/** 按类型筛选素材。 */
function assetsByType(types: string[]): AssetItem[] {
  return props.project.assets.items.filter((asset) => types.includes(asset.type) && matchesQuery(asset.name, asset.id, asset.path));
}

/** 搜索后的脚本树叶子项。 */
const scriptItems = computed<ResourceTreeItem[]>(() =>
  props.project.scripts
    .filter((script) => matchesQuery(script.id, script.name))
    .map((script, index) => ({
      id: script.id,
      label: script.name || `第${index + 1}章`,
      subtitle: script.id === props.project.startScriptId ? `${script.id} · 入口` : script.id,
      section: "scripts",
      scriptId: script.id
    }))
);

/** 搜索后的角色树叶子项。 */
const characterItems = computed<ResourceTreeItem[]>(() =>
  props.project.characters
    .filter((character) => matchesQuery(character.name, character.displayName, character.id))
    .map((character) => ({
      id: character.id,
      label: character.displayName || character.name || character.id,
      subtitle: character.id,
      section: "characters"
    }))
);

/** 将素材转换为资源树叶子项。 */
function assetItems(types: string[], section: ExplorerSection = "assets"): ResourceTreeItem[] {
  return assetsByType(types).map((asset) => ({
    id: asset.id,
    label: asset.name || asset.id,
    subtitle: asset.id,
    section
  }));
}

/** 资源树分组。 */
const resourceFolders = computed<ResourceFolder[]>(() => [
  {
    key: "scripts",
    label: "脚本",
    icon: Folder,
    section: "scripts",
    items: scriptItems.value,
    expanded: true
  },
  {
    key: "characters",
    label: "角色",
    icon: User,
    section: "characters",
    items: characterItems.value,
    expanded: true
  },
  {
    key: "backgrounds",
    label: "背景",
    icon: Folder,
    section: "assets",
    items: assetItems(["background"]),
    expanded: true
  },
  {
    key: "cg",
    label: "CG",
    icon: Folder,
    section: "assets",
    items: assetItems(["image", "other"]),
    expanded: true
  },
  {
    key: "music",
    label: "音乐",
    icon: Headset,
    section: "assets",
    items: assetItems(["bgm"]),
    expanded: false
  },
  {
    key: "sound",
    label: "音效",
    icon: Headset,
    section: "assets",
    items: assetItems(["sound", "sfx", "voice"]),
    expanded: false
  },
  {
    key: "video",
    label: "视频",
    icon: VideoCamera,
    section: "assets",
    items: assetItems(["video"]),
    expanded: false
  },
  {
    key: "ui",
    label: "界面",
    icon: Picture,
    section: "assets",
    items: assetItems(["ui"]),
    expanded: false
  },
  {
    key: "font",
    label: "字体",
    icon: Collection,
    section: "assets",
    items: assetItems(["font"]),
    expanded: false
  },
  {
    key: "props",
    label: "物品",
    icon: Box,
    section: "assets",
    items: assetItems(["prop"]),
    expanded: true
  },
  {
    key: "animations",
    label: "动画",
    icon: Connection,
    section: "animations",
    items: [],
    expanded: false
  },
  {
    key: "variables",
    label: "变量",
    icon: DataLine,
    section: "variables",
    items: (props.project.variables ?? [])
      .filter((variable) => matchesQuery(variable.name, variable.description))
      .map((variable) => ({
        id: variable.name,
        label: variable.name,
        subtitle: variable.type,
        section: "variables"
      })),
    expanded: false
  }
]);

/** 当前项目根节点显示名称。 */
const projectTitle = computed(() => props.project.name || props.project.id || "VN Project");

/** 打开资源管理器区段。 */
function openSection(section: ExplorerSection): void {
  if (section === "scripts") emit("changeView", "script");
  if (section === "assets") emit("changeView", "assets");
  if (section === "characters") emit("changeView", "characters");
  if (section === "variables") emit("changeView", "variables");
  if (section === "export") emit("changeView", "export");
  if (section === "animations") emit("openAnimations");
}

/** 点击资源树文件夹。 */
function folderMatchesSearch(folder: ResourceFolder): boolean {
  if (!normalizedQuery.value) return false;
  return matchesQuery(folder.label) || Boolean(folder.items?.length);
}

function isFolderExpanded(folder: ResourceFolder): boolean {
  if (normalizedQuery.value) return folderMatchesSearch(folder);
  return expandedFolderKeys.value.includes(folder.key);
}

function toggleFolderExpanded(folder: ResourceFolder): void {
  if (normalizedQuery.value) return;
  if (expandedFolderKeys.value.includes(folder.key)) {
    expandedFolderKeys.value = expandedFolderKeys.value.filter((key) => key !== folder.key);
    return;
  }
  expandedFolderKeys.value = [...expandedFolderKeys.value, folder.key];
}

function handleFolderClick(folder: ResourceFolder): void {
  selectedFolderKey.value = folder.key;
  toggleFolderExpanded(folder);
  if (folder.section) openSection(folder.section);
}

/** 点击资源树叶子项。 */
function handleItemClick(item: ResourceTreeItem, folder: ResourceFolder): void {
  selectedFolderKey.value = folder.key;
  if (item.scriptId) {
    emit("selectScript", item.scriptId);
    return;
  }
  openSection(item.section);
}

/** 打开脚本右键菜单。 */
function openScriptContextMenu(event: MouseEvent, item: ResourceTreeItem): void {
  if (!item.scriptId) return;
  emit("selectScript", item.scriptId);
  scriptContextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    scriptId: item.scriptId
  };
}

/** 关闭脚本右键菜单。 */
function closeScriptContextMenu(): void {
  scriptContextMenu.value.visible = false;
}

/** 执行脚本右键菜单命令。 */
function runScriptContextCommand(command: "rename" | "setStart" | "delete"): void {
  const scriptId = scriptContextMenu.value.scriptId;
  if (!scriptId) return;
  if (command === "rename") emit("renameScript", scriptId);
  if (command === "setStart") emit("setStartScript", scriptId);
  if (command === "delete") emit("deleteScript", scriptId);
  closeScriptContextMenu();
}

onMounted(() => {
  window.addEventListener("click", closeScriptContextMenu);
  window.addEventListener("scroll", closeScriptContextMenu, true);
});

onBeforeUnmount(() => {
  window.removeEventListener("click", closeScriptContextMenu);
  window.removeEventListener("scroll", closeScriptContextMenu, true);
});
</script>

<template>
  <section class="resource-explorer">
    <div class="resource-tree-pane">
      <div class="panel-title-row resource-panel-title">
        <strong>资源管理器</strong>
        <el-button size="small" text title="新建脚本" @click="$emit('createScript')">+</el-button>
      </div>
      <div class="resource-search-row">
        <el-input
          :model-value="searchQuery"
          class="resource-search"
          size="small"
          clearable
          placeholder="搜索资源..."
          @update:model-value="$emit('updateSearchQuery', String($event))"
        />
      </div>

      <div class="resource-tree">
        <button class="resource-tree-root" @click="openSection('scripts')">
          <span class="tree-caret">⌄</span>
          <el-icon class="resource-tree-icon resource-tree-icon--folder"><Folder /></el-icon>
          <span>{{ projectTitle }}</span>
        </button>

        <div v-for="folder in resourceFolders" :key="folder.key" class="resource-tree-group" :class="`resource-tree-group--${folder.key}`">
          <button class="resource-tree-folder" :class="{ active: selectedFolderKey === folder.key }" @click="handleFolderClick(folder)">
            <span class="tree-caret">{{ isFolderExpanded(folder) ? "⌄" : "›" }}</span>
            <el-icon class="resource-tree-icon"><component :is="folder.icon" /></el-icon>
            <span>{{ folder.label }}</span>
          </button>

          <div v-if="isFolderExpanded(folder)" class="resource-tree-children">
            <button
              v-for="item in folder.items"
              :key="`${folder.key}-${item.id}`"
              class="resource-tree-item"
              :class="[`resource-tree-item--${folder.key}`, { active: item.scriptId === selectedScriptId }]"
              @click="handleItemClick(item, folder)"
              @contextmenu.prevent="openScriptContextMenu($event, item)"
            >
              <span class="tree-indent"></span>
              <el-icon class="resource-tree-icon">
                <Document v-if="item.section === 'scripts'" />
                <User v-else-if="item.section === 'characters'" />
                <Picture v-else-if="folder.key === 'backgrounds' || folder.key === 'cg'" />
                <Headset v-else-if="folder.key === 'music' || folder.key === 'sound'" />
                <Box v-else-if="folder.key === 'props'" />
                <DataLine v-else-if="item.section === 'variables'" />
                <Document v-else />
              </el-icon>
              <span class="resource-tree-item-main">
                <span>{{ item.label }}</span>
                <small v-if="item.subtitle">{{ item.subtitle }}</small>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <teleport to="body">
      <div
        v-if="scriptContextMenu.visible"
        class="node-context-menu"
        :style="{ left: `${scriptContextMenu.x}px`, top: `${scriptContextMenu.y}px` }"
        @click.stop
        @contextmenu.prevent
      >
        <button @click="runScriptContextCommand('rename')">重命名脚本</button>
        <button :disabled="scriptContextMenu.scriptId === project.startScriptId" @click="runScriptContextCommand('setStart')">设为入口脚本</button>
        <button class="danger" :disabled="project.scripts.length <= 1" @click="runScriptContextCommand('delete')">删除脚本</button>
      </div>
    </teleport>

    <div class="resource-preview-pane">
      <slot name="preview" />
    </div>
  </section>
</template>
