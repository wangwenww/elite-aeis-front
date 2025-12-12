<template>
  <div class="word-note-process-page">
    <section class="page-hero surface-card">
      <div class="hero-text">
        <h1>英语单词笔记自动识别</h1>
        <p>上传班级 PDF，系统自动切片并调用大模型输出 Markdown</p>
      </div>
    </section>

    <a-card v-if="currentStep === 'upload'" class="content-card" title="📄 上传 PDF">
      <a-form layout="vertical">
        <a-form-item label="班级 ID" required>
          <a-input
            v-model:value="classId"
            placeholder="例如：A01 / Sec2-Star"
            :maxlength="50"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="PDF 文件" required>
          <a-upload-dragger
            v-model:fileList="fileList"
            :before-upload="beforeUpload"
            :max-count="1"
            accept=".pdf"
            :disabled="uploading"
          >
            <p class="ant-upload-drag-icon">
              <inbox-outlined />
            </p>
            <p class="ant-upload-text">点击或拖拽 PDF 至此区域，自动进入识别流程</p>
            <p class="ant-upload-hint">仅支持 PDF，单份 ≤ 100MB</p>
          </a-upload-dragger>
        </a-form-item>

        <a-button
          type="primary"
          size="large"
          block
          :loading="uploading"
          :disabled="!classId.trim() || fileList.length === 0"
          @click="handleUpload"
        >
          {{ uploading ? '上传中…' : '上传并开始识别' }}
        </a-button>
      </a-form>

      <a-alert
        v-if="error"
        :message="error"
        type="error"
        show-icon
        style="margin-top: 16px"
      />
    </a-card>

    <a-card
      v-else-if="currentStep === 'processing'"
      class="content-card"
      title="🤖 正在自动识别"
    >
      <div class="processing-wrapper">
        <a-result
          status="info"
          title="系统正在切片并调用视觉大模型识别"
          sub-title="此过程可能需要数分钟，请保持页面开启"
        />
        <a-progress
          :percent="recognitionProgress"
          :status="recognitionStatus === 'failed' ? 'exception' : 'active'"
        />
        <p class="processing-status">
          状态：{{ getStatusText(recognitionStatus) }} · 总页数 {{ totalPages }}
        </p>
        <a-alert
          v-if="error"
          :message="error"
          type="error"
          show-icon
        />
      </div>
    </a-card>

    <a-card v-else class="content-card" title="✅ 识别完成">
      <div v-if="result" class="result-summary">
        <a-descriptions bordered :column="2">
          <a-descriptions-item label="班级 ID">{{ classId }}</a-descriptions-item>
          <a-descriptions-item label="总页数">
            {{ result.stats?.totalPages || totalPages }}
          </a-descriptions-item>
          <a-descriptions-item label="识别词条">
            {{ result.stats?.recognizedItems || 0 }}
          </a-descriptions-item>
          <a-descriptions-item label="处理耗时">
            {{ result.stats?.processingTime ? `${result.stats.processingTime}s` : '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="自动补全">
            日期 {{ result.stats?.autoFilledDates || 0 }} / 时段 {{ result.stats?.autoFilledSessions || 0 }}
          </a-descriptions-item>
          <a-descriptions-item label="失败页数">
            {{ result.stats?.failedPages || 0 }}
          </a-descriptions-item>
        </a-descriptions>

        <a-alert
          v-if="result.stats?.failedPageNumbers?.length"
          type="warning"
          show-icon
          style="margin-top: 16px"
        >
          <template #message>
            以下页面识别失败：{{ result.stats.failedPageNumbers.join(', ') }}
          </template>
        </a-alert>

        <div class="result-actions">
          <a-button type="primary" @click="handleViewFile" :disabled="!result.filePath">
            查看 Markdown
          </a-button>
          <a-button @click="handleViewHistory">查看历史记录</a-button>
          <a-button @click="handleContinue">继续处理</a-button>
          <a-button @click="handleReset">重新上传</a-button>
        </div>
      </div>
      <a-empty v-else description="暂无识别结果" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { message } from 'ant-design-vue';
import { InboxOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { useWordNotes } from '../composables/useWordNotes.js';

const {
  currentStep,
  classId,
  totalPages,
  recognitionProgress,
  recognitionStatus,
  result,
  error,
  uploading,
  uploadPDF,
  pollProgress,
  reset,
} = useWordNotes();
const router = useRouter();

const fileList = ref([]);
let progressTimer = null;

function beforeUpload(file) {
  const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');
  if (!isPDF) {
    message.error('仅支持 PDF 文件');
    return false;
  }
  const isLt100M = file.size / 1024 / 1024 < 100;
  if (!isLt100M) {
    message.error('文件大小不能超过 100MB');
    return false;
  }
  return false;
}

async function handleUpload() {
  if (!classId.value.trim()) {
    message.error('请输入班级ID');
    return;
  }
  if (fileList.value.length === 0) {
    message.error('请选择 PDF 文件');
    return;
  }

  try {
    const file = fileList.value[0].originFileObj || fileList.value[0];
    await uploadPDF(file);
    message.success('上传成功，已开始自动识别');
    startProgressPolling();
  } catch (err) {
    message.error(err.message || '上传失败');
  }
}

function startProgressPolling() {
  stopProgressPolling();
  progressTimer = setInterval(async () => {
    const shouldContinue = await pollProgress();
    if (!shouldContinue) {
      stopProgressPolling();
    }
  }, 2000);
}

function stopProgressPolling() {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}

function getStatusText(status) {
  const statusMap = {
    idle: '待处理',
    processing: '处理中',
    completed: '已完成',
    failed: '失败',
  };
  return statusMap[status] || status;
}

function handleViewFile() {
  if (result.value?.filePath) {
    window.open(resolveApiUrl(result.value.filePath), '_blank');
  } else {
    message.info('当前没有可查看的文件');
  }
}

function resolveApiUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/api/')) return path;
  return path.startsWith('/') ? `/api${path}` : `/api/${path}`;
}

function handleViewHistory() {
  const query = {};
  if (classId.value.trim()) {
    query.classId = classId.value.trim();
  }
  router.push({
    name: 'word-notes-jobs',
    query,
  });
}

function handleContinue() {
  stopProgressPolling();
  reset();
  fileList.value = [];
  message.success('可以继续上传新的文档');
}

function handleReset() {
  stopProgressPolling();
  reset();
  fileList.value = [];
  message.info('已重置流程');
}

onUnmounted(() => {
  stopProgressPolling();
});
</script>

<style scoped>
.word-note-process-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24px;
}

.page-hero {
  margin-bottom: 24px;
  padding: 32px;
  border-radius: 8px;
}

.hero-text h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
  color: #1f2933;
}

.hero-text p {
  margin: 0;
  color: #5f6b76;
}

.content-card {
  max-width: 960px;
  margin: 0 auto;
}

.processing-wrapper {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.processing-status {
  margin-top: 12px;
  color: #5f6b76;
}

.result-summary {
  padding: 12px 0;
}

.result-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
  justify-content: center;
}
</style>
