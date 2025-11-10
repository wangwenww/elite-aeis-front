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
          <a-sub-menu key="schedule-menu">
            <template #title>课表管理</template>
            <a-menu-item key="schedule">课表制定</a-menu-item>
            <a-menu-item key="snapshot-list">快照管理</a-menu-item>
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

const logoUrl = new URL('../assets/logo-placeholder.svg', import.meta.url).href;

const routeKeyMap = {
  schedule: 'schedule',
  'snapshot-list': 'snapshot-list',
  'snapshot-detail': 'snapshot-list',
};

const selectedKeys = computed(() => {
  const name = route.name;
  const mapped = routeKeyMap[name] || 'schedule';
  return [mapped];
});

function handleMenuClick({ key }) {
  if (!key) return;
  const target = key === 'schedule' ? { name: 'schedule' } : { name: key };
  router.push(target).catch(() => {});
}

function goHome() {
  router.push({ name: 'schedule' }).catch(() => {});
}
</script>

<style scoped>
.app-head-banner {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
  background: linear-gradient(120deg, rgba(18, 38, 32, 0.92), rgba(25, 50, 28, 0.88));
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18);
}

.banner-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  gap: 24px;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.brand-block:hover {
  transform: translateY(-1px);
  opacity: 0.95;
}

.logo-wrap {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.08);
}

.brand-logo {
  width: 48px;
  height: auto;
  display: block;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-name {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.02em;
}

.brand-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.72);
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
  color: rgba(255, 255, 255, 0.86);
  font-size: 15px;
  font-weight: 500;
  padding: 0 18px;
}

.nav-block :deep(.ant-menu-horizontal > .ant-menu-item::after),
.nav-block :deep(.ant-menu-horizontal > .ant-menu-submenu::after) {
  border-bottom: 2px solid rgba(255, 255, 255, 0.85);
  border-radius: 2px;
}

.nav-block :deep(.ant-menu-item-selected) {
  color: #52c41a;
}

.nav-block :deep(.ant-menu-item-selected::after) {
  border-bottom-color: #52c41a;
}

.extra-block {
  display: flex;
  align-items: center;
  gap: 12px;
}

.extra-block :deep(.ant-tag) {
  background: rgba(82, 196, 26, 0.18);
  border: none;
  color: #bbf7d0;
  font-weight: 600;
}

@media (max-width: 960px) {
  .banner-inner {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 20px;
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

