<template>
  <a-card class="toolbar-card" :bordered="false">
    <div class="toolbar-actions">
      <a-select
        class="toolbar-select"
        :options="studentOptions"
        :value="currentStudentId ?? null"
        allow-clear
        show-search
        :filter-option="filterOption"
        placeholder="请选择学生"
        @change="onStudentChange"
      />

      <a-date-picker
        class="toolbar-select"
        picker="month"
        format="YYYY年MM月"
        :value="selectedMonthValue"
        :allowClear="false"
        @change="onMonthSelect"
      />

      <a-button class="toolbar-btn ghost" :title="'利用快捷批量添加，为选定课程生成整月排课'" @click="emit('open-quick-add')">
        <ThunderboltOutlined />
        <span>快捷批量添加</span>
      </a-button>

      <a-button class="toolbar-btn primary" type="primary" :disabled="saveDisabled" @click="emit('save-snapshot')">
        <SaveOutlined />
        <span>保存课表</span>
      </a-button>

      <slot name="extra-actions">
        <a-button class="toolbar-btn link" type="link" disabled>
          <FileTextOutlined />
          <span>导出 PDF</span>
        </a-button>
      </slot>
    </div>
  </a-card>
</template>

<script setup>
import { computed } from 'vue';
import dayjs from 'dayjs';
import { ThunderboltOutlined, SaveOutlined, FileTextOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  studentOptions: {
    type: Array,
    default: () => [],
  },
  currentStudentId: {
    type: [Number, String, null],
    default: null,
  },
  selectedMonth: {
    type: String,
    default: '',
  },
  saveDisabled: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['change-student', 'change-month', 'open-quick-add', 'save-snapshot']);

const selectedMonthValue = computed(() => (props.selectedMonth ? dayjs(props.selectedMonth, 'YYYY-MM') : null));

function onStudentChange(value) {
  emit('change-student', value ?? null);
}

function onMonthSelect(date, dateString) {
  emit('change-month', dateString || (date ? dayjs(date).format('YYYY-MM') : ''));
}

function filterOption(input, option) {
  return (option?.label ?? '').toLowerCase().includes((input || '').toLowerCase());
}
</script>

<style scoped>
.toolbar-card {
  margin-bottom: 24px;
}

.toolbar-card :deep(.ant-card-body) {
  padding: 20px 24px;
}

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.toolbar-select {
  min-width: 220px;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 0 16px;
}

.toolbar-btn.ghost {
  color: #1677ff;
  border-color: #91caff;
  background: #f0f5ff;
}

.toolbar-btn.ghost:hover {
  color: #0958d9;
  border-color: #1677ff;
  background: #e6f4ff;
}

.toolbar-btn.primary:disabled {
  background: #91caff;
  border-color: #91caff;
  color: #ffffff;
}

.toolbar-btn.link {
  color: #1677ff;
  border: none;
  padding: 0;
}

@media (max-width: 768px) {
  .toolbar-card :deep(.ant-card-body) {
    padding: 18px 20px;
  }
}

@media (max-width: 576px) {
  .toolbar-select {
    min-width: 100%;
  }
}
</style>
