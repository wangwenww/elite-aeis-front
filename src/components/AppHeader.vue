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
  position: sticky;
  top: 0;
  z-index: 100;
  background: #ffffff;
  border-bottom: 1px solid #e5e9f0;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.1);
}

.banner-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 32px;
  gap: 24px;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  padding: 6px 10px;
  border-radius: 12px;
}

.brand-block:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.1);
  background: rgba(226, 232, 240, 0.45);
}

.logo-wrap {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  overflow: hidden;
  background: #eff4fb;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d8e1ee;
}

.brand-logo {
  width: 42px;
  height: auto;
  display: block;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.brand-name {
  font-size: 19px;
  font-weight: 700;
  color: #14213d;
  letter-spacing: 0.015em;
}

.brand-sub {
  font-size: 13px;
  color: #4f6274;
}

.nav-block {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-block :deep(.ant-menu) {
  background: transparent;
  border-bottom: none;
}

.nav-block :deep(.ant-menu-item),
.nav-block :deep(.ant-menu-submenu-title) {
  color: #1f2a37;
  font-size: 15px;
  font-weight: 500;
  padding: 0 18px;
}

.nav-block :deep(.ant-menu-horizontal > .ant-menu-item::after),
.nav-block :deep(.ant-menu-horizontal > .ant-menu-submenu::after) {
  border-bottom: 2px solid rgba(29, 78, 216, 0.6);
  border-radius: 2px;
}

.nav-block :deep(.ant-menu-item-selected) {
  color: #1d4ed8;
}

.nav-block :deep(.ant-menu-item-selected::after) {
  border-bottom-color: #1d4ed8;
}

.extra-block {
  display: flex;
  align-items: center;
  gap: 12px;
}

.extra-block :deep(.ant-tag) {
  background: rgba(29, 78, 216, 0.12);
  border: none;
  color: #1d4ed8;
  font-weight: 600;
}

@media (max-width: 960px) {
  .banner-inner {
    flex-direction: column;
    align-items: flex-start;
    padding: 14px 20px;
    gap: 18px;
  }

  .nav-block {
    width: 100%;
    justify-content: flex-start;
  }

  .extra-block {
    align-self: stretch;
    justify-content: flex-start;
  }
}
</style>

