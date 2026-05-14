<script setup lang="ts">
import type { SaveSlot } from "@vn-engine/vn-ui-runtime";

/** 组件属性。 */
defineProps<{
  /** 面板模式。 */
  mode: "save" | "load";
  /** 固定槽位 id。 */
  slotIds: string[];
  /** 当前存档列表。 */
  saves: SaveSlot[];
}>();

/** 组件事件。 */
defineEmits<{
  /** 关闭面板。 */
  close: [];
  /** 保存到槽位。 */
  save: [slotId: string];
  /** 读取槽位。 */
  load: [slotId: string];
  /** 删除槽位。 */
  remove: [slotId: string];
}>();

/** 查找指定槽位存档。 */
function findSave(saves: SaveSlot[], slotId: string): SaveSlot | undefined {
  return saves.find((slot) => slot.slotId === slotId);
}

/** 格式化保存时间。 */
function formatTime(value?: string): string {
  if (!value) return "";
  return new Date(value).toLocaleString();
}
</script>

<template>
  <section class="runtime-overlay">
    <div class="panel-card save-panel">
      <header class="panel-header">
        <h2>{{ mode === "save" ? "保存进度" : "读取存档" }}</h2>
        <button type="button" @click="$emit('close')">关闭</button>
      </header>

      <div class="save-grid">
        <article v-for="slotId in slotIds" :key="slotId" class="save-slot">
          <template v-if="findSave(saves, slotId)">
            <h3>{{ findSave(saves, slotId)?.title }}</h3>
            <time>{{ formatTime(findSave(saves, slotId)?.savedAt) }}</time>
            <p>{{ findSave(saves, slotId)?.speakerName ? `${findSave(saves, slotId)?.speakerName}：` : "" }}{{ findSave(saves, slotId)?.previewText }}</p>
          </template>
          <template v-else>
            <h3>{{ slotId }}</h3>
            <p class="empty-slot">空存档</p>
          </template>

          <div class="slot-actions">
            <button v-if="mode === 'save'" type="button" @click="$emit('save', slotId)">保存</button>
            <button type="button" :disabled="!findSave(saves, slotId)" @click="$emit('load', slotId)">读取</button>
            <button type="button" :disabled="!findSave(saves, slotId)" @click="$emit('remove', slotId)">删除</button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
