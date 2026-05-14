<script setup lang="ts">
import type { ChoiceOption } from "@vn-engine/vn-schema";

/** 组件属性。 */
defineProps<{
  /** 当前选项列表。 */
  choices: ChoiceOption[];
}>();

/** 组件事件。 */
defineEmits<{
  /** 选择某个选项。 */
  choose: [optionId: string];
}>();
</script>

<template>
  <div class="choices">
    <button v-for="choice in choices" :key="choice.id" type="button" @click="$emit('choose', choice.id)">
      {{ choice.text }}
    </button>
  </div>
</template>
