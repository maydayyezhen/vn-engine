<script setup lang="ts">
import { FolderOpened, Guide, Help, Operation, Promotion, Setting, Tools, View } from "@element-plus/icons-vue";
import type { EditorView } from "../stores/editorStore";

type MenuCommand =
  | "createDesktopProject"
  | "openDesktopProject"
  | "save"
  | "importProject"
  | "exportProject"
  | "loadShowcase"
  | "resetDemo"
  | "undo"
  | "redo"
  | "restartPreview"
  | "exportWeb"
  | "exportDesktopWebGame"
  | "openScript"
  | "openAssets"
  | "openCharacters"
  | "openVariables"
  | "openExport"
  | "resetLayout";

defineProps<{
  desktopMode: boolean;
}>();

const emit = defineEmits<{
  command: [command: MenuCommand];
  changeView: [view: EditorView];
}>();

function handleCommand(command: string | number | object): void {
  const value = command as MenuCommand;
  emit("command", value);
  if (value === "openScript") emit("changeView", "script");
  if (value === "openAssets") emit("changeView", "assets");
  if (value === "openCharacters") emit("changeView", "characters");
  if (value === "openVariables") emit("changeView", "variables");
  if (value === "openExport") emit("changeView", "export");
}

</script>

<template>
  <nav class="main-menu-bar" aria-label="主菜单">
    <div class="menu-brand">VN Engine Editor</div>
    <el-dropdown trigger="click" @command="handleCommand">
      <button class="menu-button"><el-icon><FolderOpened /></el-icon>项目(P)</button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item :disabled="!desktopMode" command="createDesktopProject">创建桌面工程</el-dropdown-item>
          <el-dropdown-item :disabled="!desktopMode" command="openDesktopProject">打开桌面工程</el-dropdown-item>
          <el-dropdown-item command="save">保存 / 导出</el-dropdown-item>
          <el-dropdown-item divided command="importProject">导入项目 JSON</el-dropdown-item>
          <el-dropdown-item command="exportProject">导出项目 JSON</el-dropdown-item>
          <el-dropdown-item divided command="loadShowcase">加载 Showcase Demo</el-dropdown-item>
          <el-dropdown-item command="resetDemo">重置 Demo 工程</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dropdown trigger="click" @command="handleCommand">
      <button class="menu-button"><el-icon><Operation /></el-icon>编辑(E)</button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="undo">撤销</el-dropdown-item>
          <el-dropdown-item command="redo">重做</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dropdown trigger="click" @command="handleCommand">
      <button class="menu-button"><el-icon><View /></el-icon>视图(V)</button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="openScript">剧本编辑</el-dropdown-item>
          <el-dropdown-item command="openAssets">资源管理</el-dropdown-item>
          <el-dropdown-item command="openCharacters">角色管理</el-dropdown-item>
          <el-dropdown-item command="openVariables">变量管理</el-dropdown-item>
          <el-dropdown-item command="openExport">导出页面</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dropdown trigger="click" @command="handleCommand">
      <button class="menu-button"><el-icon><Guide /></el-icon>预览(R)</button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="restartPreview">重启预览</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dropdown trigger="click" @command="handleCommand">
      <button class="menu-button"><el-icon><Tools /></el-icon>构建(B)</button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="exportWeb">打开 Web 导出面板</el-dropdown-item>
          <el-dropdown-item :disabled="!desktopMode" command="exportDesktopWebGame">桌面端导出 Web 游戏</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dropdown trigger="click" @command="handleCommand">
      <button class="menu-button"><el-icon><Promotion /></el-icon>导出(E)</button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="exportProject">导出项目 JSON</el-dropdown-item>
          <el-dropdown-item command="exportWeb">导出 Web 项目包</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dropdown trigger="click" @command="handleCommand">
      <button class="menu-button"><el-icon><Setting /></el-icon>设置(S)</button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="resetLayout">恢复初始布局</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <button class="menu-button menu-button--muted"><el-icon><Help /></el-icon>帮助(H)</button>
  </nav>
</template>
