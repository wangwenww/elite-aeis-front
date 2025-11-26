<template>
  <a-config-provider :locale="locale" :theme="theme">
    <div class="app-shell">
      <div class="ambient-bg"></div>
      <app-header />
      <main class="app-main">
        <router-view />
      </main>
    </div>
  </a-config-provider>
</template>

<script setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import AppHeader from './components/AppHeader.vue';

dayjs.locale('zh-cn');

const theme = {
  token: {
    colorPrimary: '#3b82f6',
    colorLink: '#3b82f6',
    colorSuccess: '#10b981',
    colorBgLayout: '#f8fafc',
    colorBgContainer: '#ffffff',
    colorTextBase: '#0f172a',
    borderRadius: 12,
    fontFamily: "'Inter', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
    fontSize: 14,
    lineHeight: 1.6,
  },
};

const locale = zhCN;
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding: 0 2.5rem 3rem;
  background: linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%);
  position: relative;
  overflow: hidden;
}

.ambient-bg {
  position: absolute;
  top: -20%;
  right: -10%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  filter: blur(60px);
}

.app-main {
  padding-top: 1.5rem;
  min-height: calc(100vh - 7rem);
  position: relative;
  z-index: 1;
}

@media (max-width: 960px) {
  .app-main {
    padding-top: 1rem;
  }

  .app-shell {
    padding: 0 1rem 2rem;
  }
}
</style>
