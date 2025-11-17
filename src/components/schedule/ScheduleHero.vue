<template>
  <section class="page-hero surface-card">
    <div class="hero-text">
      <h1>月度课时费管理系统</h1>
      <p>为 Elite Edu 学员提供精准的课表制定与费用结算体验</p>
      <div class="hero-meta">
        <a-tag color="blue" :bordered="false">{{ formattedMonth }}</a-tag>
        <a-tag v-if="currentStudentName" color="green" :bordered="false">学生：{{ currentStudentName }}</a-tag>
        <a-tag v-else color="gold" :bordered="false">请选择学生</a-tag>
      </div>
    </div>

    <div class="hero-metrics">
      <div class="metric-item">
        <span class="metric-label">课程节次</span>
        <span class="metric-value">{{ totalLessons }}</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">额外费用</span>
        <span class="metric-value">{{ extraExpenseCount }}</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">状态</span>
        <span class="metric-badge" :class="statusClass">{{ statusLabel }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  formattedMonth: {
    type: String,
    required: true,
  },
  currentStudentName: {
    type: String,
    default: '',
  },
  isDirty: {
    type: Boolean,
    default: false,
  },
  totalLessons: {
    type: Number,
    default: 0,
  },
  extraExpenseCount: {
    type: Number,
    default: 0,
  },
});

const statusLabel = computed(() => (props.isDirty ? '待保存' : '已同步'));
const statusClass = computed(() => (props.isDirty ? 'dirty' : 'clean'));
</script>

