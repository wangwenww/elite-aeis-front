<template>
  <section class="page-hero surface-card">
    <div class="hero-info">
      <div class="hero-text">
        <span class="hero-kicker">ELITE EDU / SNAPSHOT MERGE</span>
        <h1>合并账单汇总</h1>
        <p>
          本次包含 {{ monthCount }} 个月的快照，覆盖
          {{ studentCount }} 位学生，所有数据均来自已保存的课表快照。
        </p>
        <div class="hero-tags">
          <a-tag color="green" :bordered="false">选中 {{ monthCount }} 个月</a-tag>
          <a-tag color="blue" :bordered="false">学生 {{ studentCount }} 位</a-tag>
          <a-tag color="purple" :bordered="false">{{ monthSummary }}</a-tag>
        </div>
      </div>
      <div class="hero-metrics">
        <div
          v-for="metric in totals"
          :key="metric.currency"
          class="metric-card"
          :class="{ highlight: metric.highlight }"
        >
          <span class="metric-label">{{ metric.label }}</span>
          <span class="metric-value">{{ metric.value }}</span>
        </div>
      </div>
    </div>

    <div class="hero-students" v-if="students.length">
      <span class="section-label">涉及学生</span>
      <div class="student-list">
        <a-tag v-for="name in students" :key="name" color="cyan" :bordered="false">
          {{ name }}
        </a-tag>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  students: {
    type: Array,
    default: () => [],
  },
  months: {
    type: Array,
    default: () => [],
  },
  monthSummary: {
    type: String,
    default: '',
  },
  totals: {
    type: Array,
    default: () => [],
  },
});

const monthCount = computed(() => {
  if (props.months?.length) return props.months.length;
  if (!props.monthSummary) return 0;
  return props.monthSummary.split('、').filter(Boolean).length;
});
const studentCount = computed(() => props.students.length || 0);
</script>

<style scoped>
.page-hero {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px 32px;
  color: #1f2937;
}

.hero-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 620px;
}

.hero-kicker {
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #5f6b7c;
}

.hero-text h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  color: #102a43;
}

.hero-text p {
  margin: 0;
  font-size: 15px;
  color: #5f6b7c;
  line-height: 1.6;
}

.hero-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-tags :deep(.ant-tag) {
  border-radius: 999px;
  padding: 4px 14px;
  font-size: 13px;
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.metric-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}

.metric-card.highlight {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.3);
}

.metric-label {
  font-size: 13px;
  color: inherit;
  opacity: 0.8;
}

.metric-value {
  font-size: 20px;
  font-weight: 700;
}

.hero-students {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.student-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.student-list :deep(.ant-tag) {
  border-radius: 999px;
  font-size: 13px;
  padding: 4px 12px;
}

@media (max-width: 768px) {
  .page-hero {
    padding: 22px;
  }
}
</style>

