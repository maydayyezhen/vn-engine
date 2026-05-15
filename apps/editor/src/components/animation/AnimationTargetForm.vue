<script setup lang="ts">
import { computed } from "vue";
import type { AnimationTargets, VNProject } from "@vn-engine/vn-schema";
import type { AnimationModule } from "@vn-engine/vn-renderer-pixi";
import { getBackgroundOptions, getCharacterOptions, getPropOptions } from "../../services/resourceLookupService";

/** 组件属性。 */
const props = defineProps<{
  /** 当前项目。 */
  project: VNProject;
  /** 动画模块。 */
  animation: AnimationModule | undefined;
  /** 当前目标映射。 */
  targets: AnimationTargets;
}>();

/** 组件事件。 */
const emit = defineEmits<{
  /** 更新目标映射。 */
  updateTargets: [targets: AnimationTargets];
}>();

/** 角色选项。 */
const characterOptions = computed(() => getCharacterOptions(props.project));
/** 背景选项。 */
const backgroundOptions = computed(() => getBackgroundOptions(props.project));
/** 物品选项。 */
const propOptions = computed(() => getPropOptions(props.project));

/** 更新指定槽位目标。 */
function updateTarget(slotKey: string, type: AnimationTargets[string]["type"], id?: string): void {
  emit("updateTargets", {
    ...props.targets,
    [slotKey]: { type, id }
  });
}
</script>

<template>
  <div class="animation-target-form">
    <el-alert v-if="!animation" title="请先选择动画模块" type="info" :closable="false" />
    <template v-else>
      <el-form-item v-for="slot in animation.targetSlots" :key="slot.key" :label="slot.label">
        <el-select
          v-if="slot.type === 'character'"
          :model-value="targets[slot.key]?.id"
          filterable
          @update:model-value="(value: string) => updateTarget(slot.key, 'character', value)"
        >
          <el-option v-for="character in characterOptions" :key="character.id" :label="`${character.displayName || character.name} (${character.id})`" :value="character.id" />
        </el-select>
        <el-select
          v-else-if="slot.type === 'background'"
          :model-value="targets[slot.key]?.id"
          filterable
          @update:model-value="(value: string) => updateTarget(slot.key, 'background', value)"
        >
          <el-option v-for="asset in backgroundOptions" :key="asset.id" :label="`${asset.name} (${asset.id})`" :value="asset.id" />
        </el-select>
        <el-select
          v-else-if="slot.type === 'prop'"
          :model-value="targets[slot.key]?.id"
          filterable
          @update:model-value="(value: string) => updateTarget(slot.key, 'prop', value)"
        >
          <el-option v-for="asset in propOptions" :key="asset.id" :label="`${asset.name} (${asset.id})`" :value="asset.id" />
        </el-select>
        <el-input v-else :model-value="slot.type" disabled @update:model-value="() => updateTarget(slot.key, slot.type)" />
        <el-text v-if="slot.description" size="small" type="info">{{ slot.description }}</el-text>
      </el-form-item>
    </template>
  </div>
</template>
