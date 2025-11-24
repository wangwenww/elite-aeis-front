<template>
  <a-card class="month-card surface-card" :bordered="false">
    <template #title>
      <div class="card-title">
        <div class="title-text">
          <span class="title-icon">📅</span>
          <div class="title-info">
            <strong>{{ snapshot.year_month }}</strong>
            <span class="subtitle">{{ snapshot.student_name || '未命名学生' }}</span>
          </div>
        </div>
        <a-tag color="blue" :bordered="false">保存于 {{ formatDate(snapshot.created_at) }}</a-tag>
      </div>
    </template>

    <div class="card-body">
      <section class="section-block">
        <header class="section-header">
          <h3>课程费用明细</h3>
          <span>按课程统计该月课时与费用</span>
        </header>
        <a-table
          :data-source="courseStatistics"
          :columns="courseColumns"
          :pagination="false"
          size="small"
          :row-key="(record) => `${record.course_name}-${record.currency}`"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.key === 'price_per_class' || column.key === 'total'">
              {{ formatAmount(text, record.currency || 'CNY') }}
            </template>
            <template v-else>
              {{ text }}
            </template>
          </template>
        </a-table>
      </section>

      <section class="section-block">
        <header class="section-header">
          <h3>额外费用</h3>
          <span>保存快照时记录的额外收费或调整</span>
        </header>
        <a-table
          v-if="extraExpenses.length"
          :data-source="extraExpenses"
          :columns="extraColumns"
          :pagination="false"
          size="small"
          :row-key="(record) => record.uid || `${record.name}-${record.expense_date}`"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.key === 'amount'">
              {{ formatAmount(record.amount, record.currency || 'CNY') }}
            </template>
            <template v-else>
              {{ text }}
            </template>
          </template>
        </a-table>
        <div v-else class="empty-state">
          <span class="empty-text">该月没有额外费用记录</span>
        </div>
      </section>

      <section class="totals-block">
        <div class="totals-row">
          <span class="totals-label">课程小计</span>
          <span class="totals-value">{{ formatTotals(snapshot.statistics.course_totals) }}</span>
        </div>
        <div class="totals-row">
          <span class="totals-label">额外费用</span>
          <span class="totals-value">{{ formatTotals(snapshot.statistics.extra_totals) }}</span>
        </div>
        <div class="totals-row grand">
          <span class="totals-label">本月应付</span>
          <span class="totals-value">{{ formatTotals(snapshot.statistics.grand_totals) }}</span>
        </div>
      </section>
    </div>
  </a-card>
</template>

<script setup>
import { computed } from 'vue';
import dayjs from 'dayjs';

const props = defineProps({
  snapshot: {
    type: Object,
    required: true,
  },
  formatTotals: {
    type: Function,
    required: true,
  },
  formatAmount: {
    type: Function,
    required: true,
  },
});

const courseColumns = [
  { title: '课程名称', dataIndex: 'course_name', key: 'course_name' },
  { title: '上课时间', dataIndex: 'course_time', key: 'course_time' },
  { title: '课时数', dataIndex: 'count', key: 'count' },
  { title: '单价', dataIndex: 'price_per_class', key: 'price_per_class' },
  { title: '小计', dataIndex: 'total', key: 'total' },
  { title: '币种', dataIndex: 'currency', key: 'currency' },
];

const extraColumns = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '日期', dataIndex: 'expense_date', key: 'expense_date' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  { title: '币种', dataIndex: 'currency', key: 'currency' },
  { title: '备注', dataIndex: 'notes', key: 'notes' },
];

const courseStatistics = computed(() => {
  const stats = props.snapshot.statistics?.course_statistics || [];
  if (!stats.length) return [];

  const lessons = props.snapshot.schedule_data?.lessons || {};
  const timeById = new Map();
  const timeByName = new Map();

  Object.values(lessons).forEach((items) => {
    if (!Array.isArray(items)) return;
    items.forEach((lesson) => {
      if (!lesson || !lesson.course_time) return;
      if (lesson.course_id != null && !timeById.has(lesson.course_id)) {
        timeById.set(lesson.course_id, lesson.course_time);
      }
      if (lesson.course_name && !timeByName.has(lesson.course_name)) {
        timeByName.set(lesson.course_name, lesson.course_time);
      }
    });
  });

  return stats.map((item) => {
    if (item.course_time) return item;
    const clone = { ...item };
    if (clone.course_id != null && timeById.has(clone.course_id)) {
      clone.course_time = timeById.get(clone.course_id);
    } else if (clone.course_name && timeByName.has(clone.course_name)) {
      clone.course_time = timeByName.get(clone.course_name);
    }
    return clone;
  });
});
const extraExpenses = computed(() => props.snapshot.statistics?.extra_expenses || []);

function formatDate(value) {
  if (!value) return '--';
  return dayjs(value).format('YYYY-MM-DD HH:mm');
}
</script>

<style scoped>
.month-card :deep(.ant-card-head) {
  background: transparent;
  border-bottom: 1px solid #e2e8f0;
  padding: 20px 28px;
}

.month-card :deep(.ant-card-body) {
  padding: 24px 28px 28px;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.title-text {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #102a43;
}

.title-icon {
  font-size: 24px;
}

.title-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-info strong {
  font-size: 18px;
  font-weight: 700;
}

.subtitle {
  font-size: 13px;
  color: #64748b;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.section-header span {
  font-size: 13px;
  color: #64748b;
}

.totals-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.totals-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  color: #1e293b;
}

.totals-row.grand {
  font-weight: 700;
  font-size: 16px;
  color: #047857;
}

.totals-label {
  font-weight: 600;
}

.totals-value {
  white-space: pre-wrap;
  text-align: right;
}

.empty-state {
  padding: 16px;
  text-align: center;
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #d9d9d9;
}

.empty-text {
  font-size: 13px;
  color: #8c8c8c;
}

@media (max-width: 768px) {
  .month-card :deep(.ant-card-body) {
    padding: 20px;
  }

  .card-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>

