<template>
  <aside class="course-panel surface-border">
    <div class="panel-header">
      <div>
        <h2>课程库</h2>
        <p>拖拽课程到日历以添加课时</p>
      </div>
      <a-spin v-if="loading" size="small" />
    </div>

    <div v-if="!loading && courses.length" class="course-list">
      <a-card
        v-for="course in courses"
        :key="course.id"
        class="course-card"
        size="small"
        draggable="true"
        @dragstart="event => emit('drag-start', event, course)"
      >
        <template #title>
          <div class="course-card-title">{{ course.name }}</div>
        </template>
        <div class="course-card-meta">
          <span>{{ course.time }}</span>
          <span class="course-price">{{ formatAmount(course.price, course.currency) }}</span>
        </div>
      </a-card>
    </div>

    <div v-else-if="!loading" class="empty-state">
      <span class="empty-icon">📦</span>
      <span>暂无课程</span>
    </div>

    <a-button class="manage-button" type="default" :disabled="loading" @click="emit('manage-courses')">
      <PlusOutlined />
      <span>管理课程</span>
    </a-button>
  </aside>
</template>

<script setup>
import { PlusOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  courses: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  formatAmount: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(['drag-start', 'manage-courses']);
</script>

<style scoped>
.course-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 20px 20px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: var(--surface-card);
  min-height: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.panel-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.panel-header p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
}

.course-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  max-height: 560px;
  overflow-y: auto;
  padding-right: 4px;
}

.course-card {
  cursor: grab;
}

.course-card-title {
  font-size: 16px;
  font-weight: 600;
}

.course-card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #5f6b7c;
}

.course-price {
  font-weight: 600;
  color: #0f172a;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 14px;
  min-height: 140px;
}

.empty-icon {
  font-size: 24px;
}

.manage-button {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

@media (max-width: 1200px) {
  .course-panel {
    order: 2;
  }
}

@media (max-width: 576px) {
  .course-panel {
    padding: 18px;
  }
}
</style>
