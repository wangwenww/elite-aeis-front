<template>
  <a-card class="selected-bar surface-card" :bordered="false">
    <div class="selected-bar-header">
      <div class="title-group">
        <span class="title">已选快照</span>
        <a-tag color="green" :bordered="false">{{ items.length }} 条</a-tag>
      </div>
      <a-button type="link" size="small" @click="emit('clear')">全部清空</a-button>
    </div>

    <div class="selected-bar-body">
      <a-tag
        v-for="item in items"
        :key="item.id"
        closable
        @close="handleTagClose(item.id, $event)"
      >
        <span class="tag-student">{{ item.student_name }}</span>
        <span class="tag-divider">·</span>
        <span class="tag-month">{{ item.year_month }}</span>
        <span class="tag-divider">·</span>
        <span class="tag-time">{{ formatCreated(item.created_at) }}</span>
      </a-tag>
    </div>
  </a-card>
</template>

<script setup>
import dayjs from 'dayjs';

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['remove', 'clear']);

function handleTagClose(id, event) {
  event.preventDefault();
  emit('remove', id);
}

function formatCreated(value) {
  if (!value) {
    return '未知时间';
  }
  return `保存于 ${dayjs(value).format('MM-DD HH:mm')}`;
}
</script>

<style scoped>
.selected-bar {
  margin-bottom: 12px;
}

.selected-bar :deep(.ant-card-body) {
  padding: 18px 20px;
}

.selected-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #102a43;
}

.selected-bar-body {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.selected-bar-body :deep(.ant-tag) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #334155;
  border: none;
  font-size: 14px;
}

.tag-student {
  font-weight: 600;
}

.tag-divider {
  color: #94a3b8;
}

.tag-time {
  color: #64748b;
}

@media (max-width: 576px) {
  .selected-bar :deep(.ant-card-body) {
    padding: 16px;
  }

  .selected-bar-body :deep(.ant-tag) {
    font-size: 13px;
  }
}
</style>

