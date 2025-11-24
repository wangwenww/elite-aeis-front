<template>
  <a-card class="stats-card" :bordered="false">
    <template #title>
      <div class="card-title">
        <div class="card-title-text">
          <span class="card-icon">💰</span>
          <span>费用统计</span>
        </div>
      </div>
    </template>

    <div class="stats-summary">
      <div class="stat-item primary">
        <div class="stat-label">课程费用</div>
        <div class="stat-value stat-multiline">{{ formatTotals(statistics.course_totals) }}</div>
      </div>
      <div class="stat-item success">
        <div class="stat-label">额外费用</div>
        <div class="stat-value stat-multiline">{{ formatTotals(statistics.extra_totals) }}</div>
      </div>
      <div class="stat-item warning">
        <div class="stat-label">总计费用</div>
        <div class="stat-value stat-multiline">{{ formatTotals(statistics.grand_totals) }}</div>
      </div>
    </div>

    <a-table
      v-if="statistics.course_statistics?.length"
      class="stats-table"
      :columns="columns"
      :data-source="statistics.course_statistics"
      :pagination="false"
      size="small"
      rowKey="record => record.course_name || record.id"
    >
      <template #bodyCell="{ column, record }">
        {{ renderCell(column, record) }}
      </template>
    </a-table>

    <div v-else class="empty-state">
      <span class="empty-icon">📉</span>
      <span>暂无课程统计</span>
    </div>
  </a-card>
</template>

<script setup>
const props = defineProps({
  statistics: {
    type: Object,
    default: () => ({
      course_statistics: [],
      course_totals: [],
      extra_totals: [],
      grand_totals: [],
    }),
  },
  columns: {
    type: Array,
    default: () => [],
  },
  formatAmount: {
    type: Function,
    required: true,
  },
  formatTotals: {
    type: Function,
    required: true,
  },
});

function renderCell(column, record) {
  if (!column) return '';
  if (column.key === 'price_per_class' || column.key === 'total') {
    return props.formatAmount(record[column.dataIndex], record.currency);
  }
  if (column.key === 'currency') {
    return record.currency || 'CNY';
  }
  if (column.key === 'time_slots' || column.key === 'course_time') {
    return record.course_time || record[column.dataIndex] || '—';
  }
  const value = record[column.dataIndex];
  if (value === undefined || value === null || value === '') {
    return '—';
  }
  return value;
}
</script>

<style scoped>
.stats-card :deep(.ant-card-body) {
  padding: 22px;
}

.stats-summary {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-bottom: 20px;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.card-icon {
  font-size: 20px;
}

.stat-item {
  padding: 16px;
  border-radius: 12px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-item.primary {
  border: 1px solid #60a5fa;
  background: #eff6ff;
}

.stat-item.success {
  border: 1px solid #34d399;
  background: #ecfdf5;
}

.stat-item.warning {
  border: 1px solid #fbbf24;
  background: #fffbeb;
}

.stat-label {
  font-size: 14px;
  color: #475569;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
}

.stat-multiline {
  white-space: pre-line;
  line-height: 1.4;
}

.stats-table :deep(.ant-table-thead > tr > th) {
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
}

.stats-table :deep(.ant-table-tbody > tr > td) {
  background: #ffffff;
  border: none;
  border-bottom: 1px solid rgba(148, 163, 184, 0.28);
  font-size: 14px;
}

.empty-state {
  margin-top: 16px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #94a3b8;
  padding: 20px;
}

.empty-icon {
  font-size: 20px;
  opacity: 0.6;
}
</style>
