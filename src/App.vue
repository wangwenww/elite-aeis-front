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
    colorPrimary: '#52c41a',
    colorLink: '#52c41a',
    colorSuccess: '#52c41a',
  },
};

const locale = zhCN;
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #0b1120 20%, #111827 60%, #15253b 100%);
  color: #0b1120;
}

.app-main {
  padding: 32px 24px 48px;
  min-height: calc(100vh - 120px);
}

@media (max-width: 960px) {
  .app-main {
    padding: 24px 16px;
  }
}
</style>
