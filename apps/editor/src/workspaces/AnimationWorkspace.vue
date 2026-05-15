<script setup lang="ts">
import { computed, ref } from "vue";
import { builtinAnimations } from "@vn-engine/vn-renderer-pixi";

/** 动画分类筛选。 */
const activeCategory = ref<string>("all");

/** 动画分类列表。 */
const categories = computed(() => ["all", ...Array.from(new Set(builtinAnimations.map((animation) => animation.category)))]);

/** 当前展示的动画模块。 */
const filteredAnimations = computed(() =>
  activeCategory.value === "all" ? builtinAnimations : builtinAnimations.filter((animation) => animation.category === activeCategory.value)
);
</script>

<template>
  <section class="animation-workspace">
    <div class="panel-title-row">
      <strong>动画模块</strong>
      <el-select v-model="activeCategory" size="small" class="compact-select">
        <el-option v-for="category in categories" :key="category" :label="category === 'all' ? '全部' : category" :value="category" />
      </el-select>
    </div>
    <div class="animation-module-grid">
      <article v-for="animation in filteredAnimations" :key="animation.id" class="animation-module-card">
        <strong>{{ animation.name }}</strong>
        <code>{{ animation.id }}</code>
        <span>{{ animation.description || "暂无说明" }}</span>
        <small>分类: {{ animation.category }} / 目标: {{ animation.targetSlots.map((slot) => slot.label).join(", ") }}</small>
      </article>
    </div>
  </section>
</template>
