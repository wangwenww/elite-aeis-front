<template>
  <a-card class="filter-card" :title="title" :bordered="false">
    <a-form layout="vertical" @submit.prevent>
      <slot></slot>
      <div class="filter-actions">
        <a-button type="primary" @click="$emit('search')" :loading="loading">{{ searchButtonText }}</a-button>
        <a-button @click="$emit('reset')" :disabled="loading">{{ resetButtonText }}</a-button>
      </div>
    </a-form>
  </a-card>
</template>

<script setup>
/**
 * Reusable filter form component
 * @param {string} title - The title of the filter card
 * @param {boolean} loading - Whether the search is loading
 * @param {string} searchButtonText - Text for the search button
 * @param {string} resetButtonText - Text for the reset button
 */

defineProps({
  title: {
    type: String,
    default: '筛选条件'
  },
  loading: {
    type: Boolean,
    default: false
  },
  searchButtonText: {
    type: String,
    default: '查询'
  },
  resetButtonText: {
    type: String,
    default: '重置'
  }
});

defineEmits(['search', 'reset']);
</script>

<style scoped>
.filter-card {
  max-width: 1200px;
  margin: 0 auto 24px;
}

.filter-actions {
  display: flex;
  gap: 12px;
}
</style>