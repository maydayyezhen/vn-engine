<script setup lang="ts">
import type { StoryAudioChannel, VNAction, VNActionType, VNEasing, VNProject } from "@vn-engine/vn-schema";
import { getAudioOptions, getBackgroundOptions, getCharacterOptions, getExpressionOptions } from "../../services/resourceLookupService";

/** 组件属性。 */
const props = defineProps<{
  /** 当前项目。 */
  project: VNProject;
  /** 正在编辑的动作。 */
  action: VNAction;
  /** 是否为子动作。 */
  nested?: boolean;
}>();

/** 组件事件。 */
const emit = defineEmits<{
  /** 更新动作。 */
  updateAction: [actionId: string, patch: Partial<VNAction>];
  /** 删除动作。 */
  deleteAction: [actionId: string];
  /** 复制动作。 */
  copyAction: [actionId: string];
  /** 上移动作。 */
  moveUp: [actionId: string];
  /** 下移动作。 */
  moveDown: [actionId: string];
  /** 给并行动作新增子动作。 */
  addParallelChild: [actionId: string, type: VNActionType];
}>();

/** 支持的动作类型。 */
const actionTypes: VNActionType[] = ["wait", "scene", "showCharacter", "hideCharacter", "moveCharacter", "changeExpression", "camera", "playAudio", "stopAudio", "parallel"];
/** 支持的缓动类型。 */
const easings: VNEasing[] = ["linear", "easeIn", "easeOut", "easeInOut"];
/** 支持的音频通道。 */
const audioChannels: StoryAudioChannel[] = ["bgm", "sound", "voice"];

/** 更新当前动作字段。 */
function patch(patchValue: Partial<VNAction>): void {
  emit("updateAction", props.action.id, patchValue);
}
</script>

<template>
  <el-card class="action-item" shadow="never">
    <template #header>
      <div class="action-item-header">
        <strong>{{ action.type }}</strong>
        <span class="muted">{{ action.id }}</span>
        <el-button-group>
          <el-button size="small" @click="$emit('moveUp', action.id)">上移</el-button>
          <el-button size="small" @click="$emit('moveDown', action.id)">下移</el-button>
          <el-button size="small" @click="$emit('copyAction', action.id)">复制</el-button>
          <el-button size="small" type="danger" @click="$emit('deleteAction', action.id)">删除</el-button>
        </el-button-group>
      </div>
    </template>

    <el-form label-position="top" class="action-form">
      <div class="inline-fields">
        <el-form-item label="type">
          <el-select :model-value="action.type" @update:model-value="(value: VNActionType) => patch({ type: value } as Partial<VNAction>)">
            <el-option v-for="type in actionTypes" :key="type" :label="type" :value="type" />
          </el-select>
        </el-form-item>
        <el-form-item label="durationMs">
          <el-input-number :model-value="action.durationMs ?? (action.type === 'wait' ? 500 : 300)" :min="0" :max="10000" @update:model-value="(value: number | undefined) => patch({ durationMs: value ?? 300 } as Partial<VNAction>)" />
        </el-form-item>
        <el-form-item label="easing">
          <el-select :model-value="action.easing ?? 'linear'" @update:model-value="(value: VNEasing) => patch({ easing: value } as Partial<VNAction>)">
            <el-option v-for="easing in easings" :key="easing" :label="easing" :value="easing" />
          </el-select>
        </el-form-item>
      </div>

      <template v-if="action.type === 'scene'">
        <el-form-item label="backgroundAssetId">
          <el-select :model-value="action.backgroundAssetId" filterable @update:model-value="(value: string) => patch({ backgroundAssetId: value } as Partial<VNAction>)">
            <el-option v-for="asset in getBackgroundOptions(project)" :key="asset.id" :label="`${asset.name} (${asset.id})`" :value="asset.id" />
          </el-select>
        </el-form-item>
      </template>

      <template v-if="['showCharacter', 'hideCharacter', 'moveCharacter', 'changeExpression'].includes(action.type)">
        <el-form-item label="characterId">
          <el-select :model-value="'characterId' in action ? action.characterId : ''" filterable @update:model-value="(value: string) => patch({ characterId: value } as Partial<VNAction>)">
            <el-option v-for="character in getCharacterOptions(project)" :key="character.id" :label="`${character.displayName || character.name} (${character.id})`" :value="character.id" />
          </el-select>
        </el-form-item>
      </template>

      <template v-if="action.type === 'showCharacter' || action.type === 'changeExpression'">
        <el-form-item label="expression">
          <el-select :model-value="action.expression" filterable @update:model-value="(value: string) => patch({ expression: value } as Partial<VNAction>)">
            <el-option v-for="expression in getExpressionOptions(project, action.characterId)" :key="expression.id" :label="`${expression.name} (${expression.id})`" :value="expression.id" />
          </el-select>
        </el-form-item>
      </template>

      <template v-if="action.type === 'showCharacter' || action.type === 'moveCharacter'">
        <div class="inline-fields">
          <el-form-item label="position">
            <el-select :model-value="action.position ?? 'center'" @update:model-value="(value: string) => patch({ position: value } as Partial<VNAction>)">
              <el-option label="left" value="left" />
              <el-option label="center" value="center" />
              <el-option label="right" value="right" />
              <el-option label="custom" value="custom" />
            </el-select>
          </el-form-item>
          <el-form-item label="x">
            <el-input-number :model-value="action.x ?? 640" @update:model-value="(value: number | undefined) => patch({ x: value ?? 640 } as Partial<VNAction>)" />
          </el-form-item>
          <el-form-item label="y">
            <el-input-number :model-value="action.y ?? 575" @update:model-value="(value: number | undefined) => patch({ y: value ?? 575 } as Partial<VNAction>)" />
          </el-form-item>
        </div>
        <div class="inline-fields">
          <el-form-item label="scale">
            <el-input-number :model-value="action.scale ?? 1" :min="0.1" :max="5" :step="0.1" @update:model-value="(value: number | undefined) => patch({ scale: value ?? 1 } as Partial<VNAction>)" />
          </el-form-item>
          <el-form-item label="opacity">
            <el-input-number :model-value="action.opacity ?? 1" :min="0" :max="1" :step="0.05" @update:model-value="(value: number | undefined) => patch({ opacity: value ?? 1 } as Partial<VNAction>)" />
          </el-form-item>
          <el-form-item label="zIndex">
            <el-input-number :model-value="action.zIndex ?? 0" @update:model-value="(value: number | undefined) => patch({ zIndex: value ?? 0 } as Partial<VNAction>)" />
          </el-form-item>
          <el-form-item label="flipX">
            <el-switch :model-value="action.flipX ?? false" @update:model-value="(value: boolean) => patch({ flipX: value } as Partial<VNAction>)" />
          </el-form-item>
        </div>
      </template>

      <template v-if="action.type === 'showCharacter'">
        <el-form-item label="enterEffect">
          <el-select :model-value="action.enterEffect ?? 'none'" @update:model-value="(value: string) => patch({ enterEffect: value } as Partial<VNAction>)">
            <el-option label="none" value="none" />
            <el-option label="fadeIn" value="fadeIn" />
            <el-option label="slideInLeft" value="slideInLeft" />
            <el-option label="slideInRight" value="slideInRight" />
          </el-select>
        </el-form-item>
      </template>

      <template v-if="action.type === 'hideCharacter'">
        <el-form-item label="exitEffect">
          <el-select :model-value="action.exitEffect ?? 'none'" @update:model-value="(value: string) => patch({ exitEffect: value } as Partial<VNAction>)">
            <el-option label="none" value="none" />
            <el-option label="fadeOut" value="fadeOut" />
            <el-option label="slideOutLeft" value="slideOutLeft" />
            <el-option label="slideOutRight" value="slideOutRight" />
          </el-select>
        </el-form-item>
      </template>

      <template v-if="action.type === 'camera'">
        <div class="inline-fields">
          <el-form-item label="zoom">
            <el-input-number :model-value="action.zoom ?? 1" :min="0.1" :max="5" :step="0.1" @update:model-value="(value: number | undefined) => patch({ zoom: value ?? 1 } as Partial<VNAction>)" />
          </el-form-item>
          <el-form-item label="offsetX">
            <el-input-number :model-value="action.offsetX ?? 0" @update:model-value="(value: number | undefined) => patch({ offsetX: value ?? 0 } as Partial<VNAction>)" />
          </el-form-item>
          <el-form-item label="offsetY">
            <el-input-number :model-value="action.offsetY ?? 0" @update:model-value="(value: number | undefined) => patch({ offsetY: value ?? 0 } as Partial<VNAction>)" />
          </el-form-item>
          <el-form-item label="shake">
            <el-switch :model-value="action.shake ?? false" @update:model-value="(value: boolean) => patch({ shake: value } as Partial<VNAction>)" />
          </el-form-item>
          <el-form-item label="shakeIntensity">
            <el-input-number :model-value="action.shakeIntensity ?? 0" :min="0" :max="100" @update:model-value="(value: number | undefined) => patch({ shakeIntensity: value ?? 0 } as Partial<VNAction>)" />
          </el-form-item>
        </div>
      </template>

      <template v-if="action.type === 'playAudio'">
        <div class="inline-fields">
          <el-form-item label="channel">
            <el-select :model-value="action.channel" @update:model-value="(value: StoryAudioChannel) => patch({ channel: value } as Partial<VNAction>)">
              <el-option v-for="channel in audioChannels" :key="channel" :label="channel" :value="channel" />
            </el-select>
          </el-form-item>
          <el-form-item label="assetId">
            <el-select :model-value="action.assetId" filterable @update:model-value="(value: string) => patch({ assetId: value } as Partial<VNAction>)">
              <el-option v-for="asset in getAudioOptions(project)" :key="asset.id" :label="`${asset.name} (${asset.id})`" :value="asset.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="loop">
            <el-switch :model-value="action.loop ?? false" @update:model-value="(value: boolean) => patch({ loop: value } as Partial<VNAction>)" />
          </el-form-item>
        </div>
      </template>

      <template v-if="action.type === 'stopAudio'">
        <el-form-item label="channel">
          <el-select :model-value="action.channel ?? ''" clearable @update:model-value="(value: StoryAudioChannel | '') => patch({ channel: value || undefined } as Partial<VNAction>)">
            <el-option v-for="channel in audioChannels" :key="channel" :label="channel" :value="channel" />
          </el-select>
        </el-form-item>
      </template>

      <template v-if="action.type === 'parallel'">
        <el-divider>并行动作</el-divider>
        <div class="inline-fields">
          <el-select placeholder="新增子动作" @change="(value: VNActionType) => $emit('addParallelChild', action.id, value)">
            <el-option v-for="type in actionTypes.filter((item) => item !== 'parallel')" :key="type" :label="type" :value="type" />
          </el-select>
        </div>
        <ActionItemEditor
          v-for="child in action.actions"
          :key="child.id"
          :project="project"
          :action="child"
          nested
          @update-action="(...args) => $emit('updateAction', ...args)"
          @delete-action="(...args) => $emit('deleteAction', ...args)"
          @copy-action="(...args) => $emit('copyAction', ...args)"
          @move-up="(...args) => $emit('moveUp', ...args)"
          @move-down="(...args) => $emit('moveDown', ...args)"
          @add-parallel-child="(...args) => $emit('addParallelChild', ...args)"
        />
      </template>
    </el-form>
  </el-card>
</template>
