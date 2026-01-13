<template>
  <header class="app-head-banner">
    <div class="banner-inner">
      <div class="brand-block" @click="goHome">
        <div class="logo-wrap">
          <img :src="logoUrl" alt="Elite Edu Logo" class="brand-logo" />
        </div>
        <div class="brand-text">
          <span class="brand-name">Elite Edu</span>
          <span class="brand-sub">新加坡壹立教育</span>
        </div>
      </div>

      <nav class="nav-block">
        <a-menu
          mode="horizontal"
          :selected-keys="selectedKeys"
          trigger-sub-menu-action="click"
          @click="handleMenuClick"
        >
          <a-menu-item key="elite-home">公司首页</a-menu-item>
          <a-sub-menu key="schedule-menu">
            <template #title>课表管理</template>
            <a-menu-item key="schedule">课表制定</a-menu-item>
            <a-menu-item key="snapshot-list">快照管理</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="learning-menu">
            <template #title>学习资源</template>
            <a-menu-item key="geometry-lesson">几何公式课堂</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="english-menu">
            <template #title>英语教学</template>
            <a-menu-item key="word-notes">单词识别</a-menu-item>
            <a-menu-item key="word-notes-jobs">单词管理</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="academic-menu">
            <template #title>教务管理</template>
            <a-menu-item key="class-list">班级管理</a-menu-item>
            <a-menu-item key="student-list">学生管理</a-menu-item>
            <a-menu-item key="grade-entry">成绩录入</a-menu-item>
            <a-menu-item key="grade-display">试卷成绩展示</a-menu-item>
            <a-menu-item key="grade-analysis">成绩分析</a-menu-item>
            <a-menu-item key="photo-crop">照片裁剪</a-menu-item>
            <a-menu-item key="payment-form">课程缴费单</a-menu-item>
          </a-sub-menu>
        </a-menu>
      </nav>

      <div class="extra-block">
        <slot name="extra">
          <a-tag color="success" :bordered="false">Welcome</a-tag>
        </slot>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

const logoUrl = new URL('../assets/elite-logo.png', import.meta.url).href;

const routeKeyMap = {
  'elite-home': 'elite-home',
  schedule: 'schedule',
  'snapshot-list': 'snapshot-list',
  'snapshot-detail': 'snapshot-list',
  'geometry-lesson': 'geometry-lesson',
  'word-notes': 'word-notes',
  'word-notes-jobs': 'word-notes-jobs',
  'word-notes-detail': 'word-notes-jobs',
  'class-list': 'class-list',
  'class-detail': 'class-list',
  'student-list': 'student-list',
  'grade-entry': 'grade-entry',
  'grade-display': 'grade-display',
  'student-grades': 'class-list',
  'student-grade-analysis': 'grade-analysis',
  'photo-crop': 'photo-crop',
  'payment-form': 'payment-form',
};

const selectedKeys = computed(() => {
  const name = route.name;
  const mapped = routeKeyMap[name] || null;
  return mapped ? [mapped] : [];
});

function handleMenuClick({ key }) {
  if (!key) return;
  if (key === 'elite-home') {
    router.push({ name: 'elite-home' }).catch(() => {});
  } else if (key === 'schedule') {
    router.push({ name: 'schedule' }).catch(() => {});
  } else if (key === 'class-list') {
    router.push('/classes').catch(() => {});
  } else if (key === 'student-list') {
    router.push('/students').catch(() => {});
  } else if (key === 'grade-entry') {
    router.push('/grades/entry').catch(() => {});
  } else if (key === 'grade-display') {
    router.push('/grades/display').catch(() => {});
  } else if (key === 'grade-analysis') {
    router.push('/students/1/analysis').catch(() => {});
  } else {
    router.push({ name: key }).catch(() => {});
  }
}

function goHome() {
  router.push({ name: 'elite-home' }).catch(() => {});
}
</script>

<style scoped>
.app-head-banner {
  @apply sticky top-0 z-[100] bg-white border-b border-neutral-200 shadow-soft-md backdrop-blur-sm;
  background: rgba(255, 255, 255, 0.95);
}

.banner-inner {
  @apply max-w-[1280px] mx-auto flex items-center justify-between py-3.5 px-8 gap-6;
}

.brand-block {
  @apply flex items-center gap-3.5 cursor-pointer transition-all duration-300 py-1.5 px-2.5 rounded-2xl;
}

.brand-block:hover {
  @apply -translate-y-0.5 shadow-soft-md;
  background: rgba(226, 232, 240, 0.45);
}

.logo-wrap {
  @apply w-[52px] h-[52px] rounded-2xl overflow-hidden bg-primary-50 flex items-center justify-center border border-primary-200;
}

.brand-logo {
  @apply w-[42px] h-auto block;
}

.brand-text {
  @apply flex flex-col leading-tight;
}

.brand-name {
  @apply text-lg font-bold text-neutral-900;
  letter-spacing: 0.015em;
}

.brand-sub {
  @apply text-sm text-neutral-600;
}

.nav-block {
  @apply flex-1 flex justify-center;
}

.nav-block :deep(.ant-menu) {
  @apply bg-transparent border-b-0;
}

.nav-block :deep(.ant-menu-item),
.nav-block :deep(.ant-menu-submenu-title) {
  @apply text-neutral-800 text-[15px] font-medium px-4.5;
}

.nav-block :deep(.ant-menu-horizontal > .ant-menu-item::after),
.nav-block :deep(.ant-menu-horizontal > .ant-menu-submenu::after) {
  border-bottom: 2px solid rgba(59, 130, 246, 0.6);
  border-radius: 2px;
}

.nav-block :deep(.ant-menu-item-selected) {
  @apply text-primary-600;
}

.nav-block :deep(.ant-menu-item-selected::after) {
  @apply border-primary-600;
}

.extra-block {
  @apply flex items-center gap-3;
}

.extra-block :deep(.ant-tag) {
  @apply bg-primary-50 border-0 text-primary-600 font-semibold rounded-xl px-3 py-1;
}

@media (max-width: 960px) {
  .banner-inner {
    @apply flex-col items-start py-3.5 px-5 gap-4.5;
  }

  .nav-block {
    @apply w-full justify-start;
  }

  .extra-block {
    @apply self-stretch justify-start;
  }
}
</style>

