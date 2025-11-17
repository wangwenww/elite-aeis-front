<template>
  <a-config-provider :locale="locale" :theme="theme">
    <div class="app-shell">
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
    colorPrimary: '#1d4ed8',
    colorLink: '#1d4ed8',
    colorSuccess: '#16a34a',
    colorBgLayout: '#f5f7fa',
    colorBgContainer: '#ffffff',
    colorTextBase: '#0f172a',
    borderRadius: 8,
  },
};

const locale = zhCN;
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding: 0 40px 48px;
  background: #f5f7fa;
}

.app-main {
  padding-top: 24px;
  min-height: calc(100vh - 112px);
}

@media (max-width: 960px) {
  .app-main {
    padding-top: 16px;
  }

  .app-shell {
    padding: 0 16px 32px;
    background: #f5f7fa;
  }
}
</style>
