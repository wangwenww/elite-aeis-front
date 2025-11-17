<template>
  <a-card class="totals-card surface-card" :bordered="false">
    <div class="totals-header">
      <div>
        <h2>综合统计汇总</h2>
        <p>包含所有选中月份及临时调整后的最终应付金额</p>
      </div>
      <a-space>
        <a-button @click="emit('back')">返回快照列表</a-button>
        <a-button type="primary" @click="emit('preview')">费用预览</a-button>
      </a-space>
    </div>

    <div class="totals-grid">
      <div class="totals-section">
        <h3>课程费用合计</h3>
        <ul>
          <li v-for="item in courseTotals" :key="`course-${item.currency}`">
            <span>{{ item.currency }}</span>
            <strong>{{ formatAmount(item.amount, item.currency) }}</strong>
          </li>
        </ul>
      </div>

      <div class="totals-section">
        <h3>原额外费用合计</h3>
        <ul>
          <li v-for="item in extraTotals" :key="`extra-${item.currency}`">
            <span>{{ item.currency }}</span>
            <strong>{{ formatAmount(item.amount, item.currency) }}</strong>
          </li>
        </ul>
      </div>

      <div class="totals-section">
        <h3>临时调整合计</h3>
        <ul>
          <li v-for="item in adjustmentTotals" :key="`adjust-${item.currency}`">
            <span>{{ item.currency }}</span>
            <strong>{{ formatAmount(item.amount, item.currency) }}</strong>
          </li>
        </ul>
      </div>

      <div class="totals-section highlight">
        <h3>最终应付总额</h3>
        <ul>
          <li v-for="item in finalTotals" :key="`final-${item.currency}`">
            <span>{{ item.currency }}</span>
            <strong>{{ formatAmount(item.amount, item.currency) }}</strong>
          </li>
        </ul>
      </div>
    </div>
  </a-card>
</template>

<script setup>
const props = defineProps({
  courseTotals: {
    type: Array,
    default: () => [],
  },
  extraTotals: {
    type: Array,
    default: () => [],
  },
  adjustmentTotals: {
    type: Array,
    default: () => [],
  },
  finalTotals: {
    type: Array,
    default: () => [],
  },
  formatAmount: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(['preview', 'back']);
</script>

<style scoped>
.totals-card :deep(.ant-card-body) {
  padding: 26px 30px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.totals-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.totals-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.totals-header p {
  margin: 6px 0 0;
  font-size: 14px;
  color: #64748b;
}

.totals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.totals-section {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.totals-section.highlight {
  border-color: #0f766e;
  background: linear-gradient(135deg, #0ea5e9, #0f766e);
  color: #ffffff;
}

.totals-section h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.totals-section ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.totals-section li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
}

.totals-section li strong {
  font-weight: 700;
}

@media (max-width: 768px) {
  .totals-card :deep(.ant-card-body) {
    padding: 22px;
  }

  .totals-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>

