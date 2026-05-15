<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { AssetItem, AssetType, VNProject } from "@vn-engine/vn-schema";
import { Box, Collection, DataLine, Document, Folder, Headset, Picture, User, VideoCamera } from "@element-plus/icons-vue";
import type { WorkspaceSelection } from "../stores/workspaceStore";

/** 资源树叶子项类型。 */
type ResourceItemKind = "script" | "asset" | "character" | "variable";

/** 资源树可新增的资源类型。 */
type ResourceCreateKind = "script" | "asset" | "character" | "variable";

/** 资源树文件夹配置。 */
interface ResourceFolder {
  /** 文件夹唯一标识。 */
  key: string;
  /** 文件夹显示名称。 */
  label: string;
  /** 文件夹图标组件。 */
  icon: unknown;
  /** 文件夹内的具体资源项。 */
  items: ResourceTreeItem[];
  /** 右键新增时创建的资源类别。 */
  createKind?: ResourceCreateKind;
  /** 新增素材时使用的素材类型。 */
  createAssetType?: AssetType;
}

/** 资源树叶子项配置。 */
interface ResourceTreeItem {
  /** 资源项唯一标识。 */
  id: string;
  /** 资源项显示名称。 */
  label: string;
  /** 资源项辅助说明。 */
  subtitle?: string;
  /** 资源项类型。 */
  kind: ResourceItemKind;
  /** 脚本资源对应脚本 id。 */
  scriptId?: string;
  /** 素材资源对应素材类型。 */
  assetType?: AssetType;
}

/** 资源树右键菜单状态。 */
interface ResourceContextMenu {
  /** 是否显示右键菜单。 */
  visible: boolean;
  /** 菜单左侧坐标。 */
  x: number;
  /** 菜单顶部坐标。 */
  y: number;
  /** 当前右键的文件夹。 */
  folder?: ResourceFolder;
  /** 当前右键的资源项。 */
  item?: ResourceTreeItem;
}

/** 资源管理器属性。 */
const props = defineProps<{
  /** 当前项目。 */
  project: VNProject;
  /** 当前脚本 id。 */
  selectedScriptId: string;
  /** 当前工作台选择。 */
  selection: WorkspaceSelection;
  /** 资源搜索关键字。 */
  searchQuery: string;
}>();

/** 资源管理器事件。 */
const emit = defineEmits<{
  /** 更新资源搜索关键字。 */
  updateSearchQuery: [value: string];
  /** 选择脚本。 */
  selectScript: [scriptId: string];
  /** 选择具体素材。 */
  selectAsset: [assetId: string];
  /** 选择具体角色。 */
  selectCharacter: [characterId: string];
  /** 选择具体变量。 */
  selectVariable: [variableName: string];
  /** 新建脚本。 */
  createScript: [];
  /** 重命名脚本。 */
  renameScript: [scriptId: string];
  /** 删除脚本。 */
  deleteScript: [scriptId: string];
  /** 设为入口脚本。 */
  setStartScript: [scriptId: string];
  /** 新增素材。 */
  createAsset: [assetType: AssetType];
  /** 删除素材。 */
  deleteAsset: [assetId: string];
  /** 新增角色。 */
  createCharacter: [];
  /** 删除角色。 */
  deleteCharacter: [characterId: string];
  /** 新增变量。 */
  createVariable: [];
  /** 删除变量。 */
  deleteVariable: [variableName: string];
}>();

/** 默认展开的资源目录。 */
const expandedFolderKeys = ref<string[]>(["scripts", "characters", "backgrounds", "cg", "props"]);
/** 当前焦点目录，仅用于高亮目录行。 */
const selectedFolderKey = ref("scripts");
/** 当前右键菜单状态。 */
const contextMenu = ref<ResourceContextMenu>({ visible: false, x: 0, y: 0 });

/** 标准化后的搜索文本。 */
const normalizedQuery = computed(() => props.searchQuery.trim().toLowerCase());
/** 项目根节点显示名称。 */
const projectTitle = computed(() => props.project.name || props.project.id || "VN Project");

/** 判断一组文本是否匹配当前搜索。 */
function matchesQuery(...parts: Array<string | undefined>): boolean {
  if (!normalizedQuery.value) return true;
  return parts.join(" ").toLowerCase().includes(normalizedQuery.value);
}

/** 按素材类型过滤素材。 */
function assetsByType(types: AssetType[]): AssetItem[] {
  return props.project.assets.items.filter((asset) => types.includes(asset.type) && matchesQuery(asset.name, asset.id, asset.path));
}

/** 将素材转换为资源树叶子项。 */
function createAssetItems(types: AssetType[]): ResourceTreeItem[] {
  return assetsByType(types).map((asset) => ({
    id: asset.id,
    label: asset.name || asset.id,
    subtitle: asset.id,
    kind: "asset",
    assetType: asset.type
  }));
}

/** 当前脚本资源项。 */
const scriptItems = computed<ResourceTreeItem[]>(() =>
  props.project.scripts
    .filter((script) => matchesQuery(script.id, script.name))
    .map((script, index) => ({
      id: script.id,
      label: script.name || `第${index + 1}章`,
      subtitle: script.id === props.project.startScriptId ? `${script.id} · 入口` : script.id,
      kind: "script",
      scriptId: script.id
    }))
);

/** 当前角色资源项。 */
const characterItems = computed<ResourceTreeItem[]>(() =>
  props.project.characters
    .filter((character) => matchesQuery(character.name, character.displayName, character.id))
    .map((character) => ({
      id: character.id,
      label: character.displayName || character.name || character.id,
      subtitle: character.id,
      kind: "character"
    }))
);

/** 当前变量资源项。 */
const variableItems = computed<ResourceTreeItem[]>(() =>
  (props.project.variables ?? [])
    .filter((variable) => matchesQuery(variable.name, variable.description))
    .map((variable) => ({
      id: variable.name,
      label: variable.name,
      subtitle: variable.type,
      kind: "variable"
    }))
);

/** 资源树目录列表。 */
const resourceFolders = computed<ResourceFolder[]>(() => [
  { key: "scripts", label: "脚本", icon: Folder, items: scriptItems.value, createKind: "script" },
  { key: "characters", label: "角色", icon: User, items: characterItems.value, createKind: "character" },
  { key: "backgrounds", label: "背景", icon: Folder, items: createAssetItems(["background"]), createKind: "asset", createAssetType: "background" },
  { key: "cg", label: "CG/图片", icon: Folder, items: createAssetItems(["image", "other"]), createKind: "asset", createAssetType: "image" },
  { key: "music", label: "音乐", icon: Headset, items: createAssetItems(["bgm"]), createKind: "asset", createAssetType: "bgm" },
  { key: "sound", label: "音效/语音", icon: Headset, items: createAssetItems(["sound", "sfx", "voice"]), createKind: "asset", createAssetType: "sound" },
  { key: "video", label: "视频", icon: VideoCamera, items: [], createKind: "asset", createAssetType: "other" },
  { key: "ui", label: "界面", icon: Picture, items: [], createKind: "asset", createAssetType: "image" },
  { key: "font", label: "字体", icon: Collection, items: [], createKind: "asset", createAssetType: "other" },
  { key: "props", label: "物品", icon: Box, items: createAssetItems(["prop"]), createKind: "asset", createAssetType: "prop" },
  { key: "animations", label: "动画模块", icon: Document, items: [] },
  { key: "variables", label: "变量", icon: DataLine, items: variableItems.value, createKind: "variable" }
]);

/** 搜索时目录是否应该展开。 */
function folderMatchesSearch(folder: ResourceFolder): boolean {
  if (!normalizedQuery.value) return false;
  return matchesQuery(folder.label) || folder.items.length > 0;
}

/** 目录是否展开。 */
function isFolderExpanded(folder: ResourceFolder): boolean {
  if (normalizedQuery.value) return folderMatchesSearch(folder);
  return expandedFolderKeys.value.includes(folder.key);
}

/** 切换目录展开状态。 */
function toggleFolderExpanded(folder: ResourceFolder): void {
  if (normalizedQuery.value) return;
  if (expandedFolderKeys.value.includes(folder.key)) {
    expandedFolderKeys.value = expandedFolderKeys.value.filter((key) => key !== folder.key);
    return;
  }
  expandedFolderKeys.value = [...expandedFolderKeys.value, folder.key];
}

/** 点击目录。除脚本工作流外，目录只负责展开和折叠。 */
function handleFolderClick(folder: ResourceFolder): void {
  selectedFolderKey.value = folder.key;
  toggleFolderExpanded(folder);
}

/** 点击具体资源项。 */
function handleItemClick(item: ResourceTreeItem, folder: ResourceFolder): void {
  selectedFolderKey.value = folder.key;
  if (item.kind === "script" && item.scriptId) emit("selectScript", item.scriptId);
  if (item.kind === "asset") emit("selectAsset", item.id);
  if (item.kind === "character") emit("selectCharacter", item.id);
  if (item.kind === "variable") emit("selectVariable", item.id);
}

/** 判断资源项是否选中。 */
function isItemActive(item: ResourceTreeItem): boolean {
  if (item.kind === "script") return item.scriptId === props.selectedScriptId;
  if (item.kind === "asset") return props.selection.kind === "asset" && props.selection.id === item.id;
  if (item.kind === "character") return props.selection.kind === "character" && props.selection.id === item.id;
  if (item.kind === "variable") return props.selection.kind === "variable" && props.selection.id === item.id;
  return false;
}

/** 打开资源树右键菜单。 */
function openContextMenu(event: MouseEvent, folder?: ResourceFolder, item?: ResourceTreeItem): void {
  contextMenu.value = { visible: true, x: event.clientX, y: event.clientY, folder, item };
}

/** 关闭资源树右键菜单。 */
function closeContextMenu(): void {
  contextMenu.value.visible = false;
}

/** 执行右键新增命令。 */
function runCreateCommand(): void {
  const folder = contextMenu.value.folder;
  const createKind = folder?.createKind;
  const assetType = folder?.createAssetType ?? contextMenu.value.item?.assetType;

  if (createKind === "script") emit("createScript");
  if (createKind === "character") emit("createCharacter");
  if (createKind === "variable") emit("createVariable");
  if (createKind === "asset" && assetType) emit("createAsset", assetType);
  closeContextMenu();
}

/** 执行右键删除命令。 */
function runDeleteCommand(): void {
  const item = contextMenu.value.item;
  if (!item) return;
  if (item.kind === "script" && item.scriptId) emit("deleteScript", item.scriptId);
  if (item.kind === "asset") emit("deleteAsset", item.id);
  if (item.kind === "character") emit("deleteCharacter", item.id);
  if (item.kind === "variable") emit("deleteVariable", item.id);
  closeContextMenu();
}

/** 执行脚本专属右键命令。 */
function runScriptCommand(command: "rename" | "setStart"): void {
  const scriptId = contextMenu.value.item?.scriptId;
  if (!scriptId) return;
  if (command === "rename") emit("renameScript", scriptId);
  if (command === "setStart") emit("setStartScript", scriptId);
  closeContextMenu();
}

/** 当前右键菜单是否可新增。 */
const canCreateFromContext = computed(() => Boolean(contextMenu.value.folder?.createKind));
/** 当前右键菜单是否可删除。 */
const canDeleteFromContext = computed(() => Boolean(contextMenu.value.item));

onMounted(() => {
  window.addEventListener("click", closeContextMenu);
  window.addEventListener("scroll", closeContextMenu, true);
});

onBeforeUnmount(() => {
  window.removeEventListener("click", closeContextMenu);
  window.removeEventListener("scroll", closeContextMenu, true);
});
</script>

<template>
  <section class="resource-explorer">
    <div class="resource-tree-pane">
      <div class="panel-title-row resource-panel-title">
        <strong>资源管理器</strong>
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
        <button class="resource-tree-root" @click="selectedFolderKey = 'scripts'">
          <span class="tree-caret">▾</span>
          <el-icon class="resource-tree-icon resource-tree-icon--folder"><Folder /></el-icon>
          <span>{{ projectTitle }}</span>
        </button>

        <div v-for="folder in resourceFolders" :key="folder.key" class="resource-tree-group" :class="`resource-tree-group--${folder.key}`">
          <button
            class="resource-tree-folder"
            :class="{ active: selectedFolderKey === folder.key }"
            @click="handleFolderClick(folder)"
            @contextmenu.prevent.stop="openContextMenu($event, folder)"
          >
            <span class="tree-caret">{{ isFolderExpanded(folder) ? "▾" : "▸" }}</span>
            <el-icon class="resource-tree-icon"><component :is="folder.icon" /></el-icon>
            <span>{{ folder.label }}</span>
          </button>

          <div v-if="isFolderExpanded(folder)" class="resource-tree-children">
            <button
              v-for="item in folder.items"
              :key="`${folder.key}-${item.id}`"
              class="resource-tree-item"
              :class="[`resource-tree-item--${folder.key}`, { active: isItemActive(item) }]"
              @click="handleItemClick(item, folder)"
              @contextmenu.prevent.stop="openContextMenu($event, folder, item)"
            >
              <span class="tree-indent"></span>
              <el-icon class="resource-tree-icon">
                <Document v-if="item.kind === 'script'" />
                <User v-else-if="item.kind === 'character'" />
                <Picture v-else-if="folder.key === 'backgrounds' || folder.key === 'cg'" />
                <Headset v-else-if="folder.key === 'music' || folder.key === 'sound'" />
                <Box v-else-if="folder.key === 'props'" />
                <DataLine v-else-if="item.kind === 'variable'" />
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
        v-if="contextMenu.visible"
        class="node-context-menu"
        :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
        @click.stop
        @contextmenu.prevent
      >
        <button v-if="canCreateFromContext" @click="runCreateCommand">新增</button>
        <button v-if="contextMenu.item?.kind === 'script'" @click="runScriptCommand('rename')">重命名脚本</button>
        <button
          v-if="contextMenu.item?.kind === 'script'"
          :disabled="contextMenu.item.scriptId === project.startScriptId"
          @click="runScriptCommand('setStart')"
        >
          设为入口脚本
        </button>
        <button
          v-if="canDeleteFromContext"
          class="danger"
          :disabled="contextMenu.item?.kind === 'script' && project.scripts.length <= 1"
          @click="runDeleteCommand"
        >
          删除
        </button>
      </div>
    </teleport>

    <div class="resource-preview-pane">
      <slot name="preview" />
    </div>
  </section>
</template>
