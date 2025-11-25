<template>
  <div class="word-note-detail-page">
    <a-card class="header-card" :bordered="false">
      <template #title>
        <div class="header-title">
          <a-button type="link" @click="goBack">
            <arrow-left-outlined />
            返回
          </a-button>
          <span class="title-text">识别详情 - {{ job?.classId }} ({{ job?.taskId }})</span>
        </div>
      </template>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleDownloadMarkdown" :disabled="!markdownContent">
            下载 Markdown
          </a-button>
        </a-space>
      </template>
    </a-card>

    <div class="detail-content" v-if="!loading">
      <!-- 左侧：图片翻页查看 -->
      <div class="image-panel">
        <a-card title="页面图片" :bordered="false">
          <div class="image-viewer">
            <div v-if="currentPageData" class="image-container">
              <img
                :src="currentImageUrl"
                :alt="`第 ${currentPageIndex} 页`"
                class="page-image"
                @error="handleImageError"
              />
            </div>
            <a-empty v-else description="暂无图片" />
          </div>

          <div class="image-controls">
            <a-button
              :disabled="currentPageIndex <= 1"
              @click="goToPreviousPage"
            >
              <left-outlined />
              上一页
            </a-button>
            <span class="page-indicator">
              第 {{ currentPageIndex }} / {{ totalPages }} 页
            </span>
            <a-button
              :disabled="currentPageIndex >= totalPages"
              @click="goToNextPage"
            >
              下一页
              <right-outlined />
            </a-button>
          </div>
        </a-card>
      </div>

      <!-- 右侧：Markdown内容 -->
      <div class="markdown-panel">
        <a-card title="Markdown 内容" :bordered="false">
          <div class="markdown-viewer">
            <div v-if="markdownContent" class="markdown-content" v-html="renderedMarkdown"></div>
            <a-empty v-else description="暂无Markdown内容" />
          </div>
        </a-card>
      </div>
    </div>

    <a-spin v-else :spinning="loading" style="width: 100%; padding: 100px 0">
      <div></div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  ArrowLeftOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons-vue';
import { marked } from 'marked';
import * as wordNotesAPI from '../api/wordNotes.js';
import http from '../api/http.js';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const job = ref(null);
const pages = ref([]);
const markdownContent = ref('');
const currentPageIndex = ref(1);

const totalPages = computed(() => pages.value.length);

const currentPageData = computed(() => {
  return pages.value.find(p => p.pageIndex === currentPageIndex.value);
});

const currentImageUrl = computed(() => {
  if (!currentPageData.value) return '';
  // 优先使用base64数据，如果没有则使用URL
  if (currentPageData.value.imageBase64) {
    const mime = currentPageData.value.imageMime || 'image/jpeg';
    return `data:${mime};base64,${currentPageData.value.imageBase64}`;
  }
  return currentPageData.value.imageUrl;
});

const renderedMarkdown = computed(() => {
  if (!markdownContent.value) return '';
  try {
    // 配置marked选项
    marked.setOptions({
      breaks: true, // 支持换行
      gfm: true, // 支持GitHub风格的Markdown
    });
    return marked.parse(markdownContent.value);
  } catch (e) {
    console.error('Markdown渲染失败:', e);
    return '<p>Markdown渲染失败</p>';
  }
});

async function loadDetailData() {
  const taskId = route.params.taskId;
  if (!taskId) {
    message.error('任务ID不存在');
    router.back();
    return;
  }

  loading.value = true;
  try {
    const response = await wordNotesAPI.getDetailViewData(taskId);
    job.value = response.job;
    pages.value = response.pages || [];
    markdownContent.value = response.markdownContent || '';

    if (pages.value.length > 0) {
      currentPageIndex.value = 1;
    }
  } catch (err) {
    message.error('加载详情失败: ' + (err.message || '未知错误'));
    router.back();
  } finally {
    loading.value = false;
  }
}

function goToPreviousPage() {
  if (currentPageIndex.value > 1) {
    currentPageIndex.value--;
  }
}

function goToNextPage() {
  if (currentPageIndex.value < totalPages.value) {
    currentPageIndex.value++;
  }
}

function handleImageError() {
  message.error('图片加载失败');
}

function handleDownloadMarkdown() {
  if (!markdownContent.value) {
    message.warning('没有可下载的内容');
    return;
  }

  const taskId = route.params.taskId;
  const blob = new Blob([markdownContent.value], { type: 'text/markdown' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${job.value?.classId || taskId}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
  message.success('下载成功');
}

function goBack() {
  router.back();
}

onMounted(() => {
  loadDetailData();
});
</script>

<style scoped>
.word-note-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24px;
}

.header-card {
  margin-bottom: 24px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-text {
  font-size: 18px;
  font-weight: 600;
}

.detail-content {
  display: flex;
  gap: 24px;
  height: calc(100vh - 200px);
}

.image-panel {
  flex: 1;
  min-width: 0;
}

.markdown-panel {
  flex: 1;
  min-width: 0;
}

.image-viewer {
  height: calc(100vh - 350px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-bottom: 16px;
  overflow: auto;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.page-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.page-indicator {
  font-size: 14px;
  color: #666;
  min-width: 120px;
  text-align: center;
}

.markdown-viewer {
  height: calc(100vh - 350px);
  overflow: auto;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 24px;
}

.markdown-content {
  line-height: 1.8;
  color: #333;
}

.markdown-content :deep(h1) {
  font-size: 28px;
  font-weight: 600;
  margin-top: 32px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e8e8e8;
  color: #1f2933;
}

.markdown-content :deep(h2) {
  font-size: 22px;
  font-weight: 600;
  margin-top: 28px;
  margin-bottom: 16px;
  color: #1890ff;
  padding-left: 8px;
  border-left: 4px solid #1890ff;
}

.markdown-content :deep(h3) {
  font-size: 18px;
  font-weight: 600;
  margin-top: 24px;
  margin-bottom: 12px;
  color: #52c41a;
}

.markdown-content :deep(p) {
  margin: 12px 0;
  line-height: 1.8;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  overflow: hidden;
}

.markdown-content :deep(table th),
.markdown-content :deep(table td) {
  border: 1px solid #e8e8e8;
  padding: 12px 16px;
  text-align: left;
}

.markdown-content :deep(table th) {
  background: linear-gradient(to bottom, #fafafa, #f0f0f0);
  font-weight: 600;
  color: #1f2933;
}

.markdown-content :deep(table tr:nth-child(even)) {
  background: #fafafa;
}

.markdown-content :deep(table tr:hover) {
  background: #f0f7ff;
  transition: background 0.2s;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid #e8e8e8;
  margin: 24px 0;
}

@media (max-width: 1200px) {
  .detail-content {
    flex-direction: column;
    height: auto;
  }

  .image-viewer {
    height: 400px;
  }

  .markdown-viewer {
    height: 400px;
  }
}
</style>

