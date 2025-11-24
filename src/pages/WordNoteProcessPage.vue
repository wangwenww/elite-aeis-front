<template>
  <div class="word-note-process-page">
    <!-- 页面头部 -->
    <section class="page-hero surface-card">
      <div class="hero-text">
        <h1>英语单词笔记处理</h1>
        <p>上传班级单词笔记 PDF，自动识别并生成标准化 Markdown 文件</p>
      </div>
    </section>

    <!-- 步骤1: 上传PDF -->
    <a-card v-if="currentStep === 'upload'" class="content-card" title="📄 上传 PDF">
      <a-form layout="vertical">
        <a-form-item label="班级ID" required>
          <a-input
            v-model:value="classId"
            placeholder="请输入班级ID，如：A01"
            :maxlength="20"
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
            <p class="ant-upload-text">点击或拖拽 PDF 文件到此区域上传</p>
            <p class="ant-upload-hint">仅支持 PDF 格式，最大 50MB</p>
          </a-upload-dragger>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            size="large"
            :loading="uploading"
            :disabled="!classId.trim() || fileList.length === 0"
            @click="handleUpload"
            block
          >
            {{ uploading ? '上传中...' : '开始上传' }}
          </a-button>
        </a-form-item>
      </a-form>

      <a-alert
        v-if="error"
        :message="error"
        type="error"
        show-icon
        closable
        @close="error = null"
        style="margin-top: 16px"
      />
    </a-card>

    <!-- 步骤2: 标注日期和时段 -->
    <a-card v-if="currentStep === 'annotate'" class="content-card" title="📝 标注日期和时段">
      <div class="annotation-header">
        <a-progress
          :percent="annotationProgress"
          :status="allPagesAnnotated ? 'success' : 'active'"
        />
        <div class="progress-text">
          已标注 {{ annotatedCount }} / {{ totalPages }} 页
        </div>
      </div>

      <div class="image-viewer">
        <div class="image-container">
          <img
            v-if="currentPageImageUrl"
            :src="currentPageImageUrl"
            alt="单词笔记页面"
            class="page-image"
          />
          <a-empty v-else description="加载图片中..." />
        </div>

        <div class="annotation-form">
          <a-form :model="currentAnnotation" layout="vertical">
            <a-form-item label="页码">
              <a-tag color="blue" size="large">
                第 {{ currentPageIndex }} 页 / 共 {{ totalPages }} 页
              </a-tag>
            </a-form-item>

            <a-form-item label="日期" required>
              <a-date-picker
                v-model:value="currentAnnotation.date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                placeholder="选择日期"
                style="width: 100%"
                @change="handleDateChange"
              />
            </a-form-item>

            <a-form-item label="时段" required>
              <a-radio-group
                v-model:value="currentAnnotation.session"
                @change="handleSessionChange"
              >
                <a-radio-button value="上">上</a-radio-button>
                <a-radio-button value="下">下</a-radio-button>
              </a-radio-group>
            </a-form-item>

            <a-form-item>
              <a-button
                type="default"
                @click="handleBatchSet"
                :disabled="!currentAnnotation.date || !currentAnnotation.session"
                block
              >
                从当前页开始，后续所有页使用相同标注
              </a-button>
            </a-form-item>
          </a-form>

          <div class="navigation-buttons">
            <a-button
              :disabled="currentPageIndex === 1"
              @click="goToPreviousPage"
            >
              上一页
            </a-button>
            <a-button
              type="primary"
              :disabled="currentPageIndex === totalPages"
              @click="goToNextPage"
            >
              下一页
            </a-button>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <a-button @click="handleReset">重新上传</a-button>
        <a-button
          type="primary"
          size="large"
          :disabled="!allPagesAnnotated"
          @click="handleStartRecognition"
        >
          开始识别
        </a-button>
      </div>
    </a-card>

    <!-- 步骤3: 识别进度 -->
    <a-card v-if="currentStep === 'processing'" class="content-card" title="🔄 识别处理中">
      <a-spin :spinning="recognizing" tip="正在识别中，请稍候...">
        <div class="progress-container">
          <a-progress
            type="circle"
            :percent="recognitionProgress"
            :status="recognitionStatus === 'failed' ? 'exception' : 'active'"
          />
          <div class="progress-info">
            <p>状态: {{ getStatusText(recognitionStatus) }}</p>
            <p v-if="recognitionProgress > 0">进度: {{ recognitionProgress }}%</p>
          </div>
        </div>
      </a-spin>

      <a-alert
        v-if="error"
        :message="error"
        type="error"
        show-icon
        style="margin-top: 16px"
      />
    </a-card>

    <!-- 步骤4: 结果展示 -->
    <a-card v-if="currentStep === 'result'" class="content-card" title="✅ 处理完成">
      <div v-if="result" class="result-container">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="总页数">
            {{ result.stats.totalPages }}
          </a-descriptions-item>
          <a-descriptions-item label="识别词条数">
            {{ result.stats.recognizedItems }}
          </a-descriptions-item>
          <a-descriptions-item label="处理耗时">
            {{ result.stats.processingTime }} 秒
          </a-descriptions-item>
          <a-descriptions-item label="失败页数">
            {{ result.stats.failedPages || 0 }}
          </a-descriptions-item>
        </a-descriptions>

        <div v-if="result.stats.failedPageNumbers && result.stats.failedPageNumbers.length > 0" class="failed-pages">
          <a-alert
            :message="`以下页面识别失败：第 ${result.stats.failedPageNumbers.join(', ')} 页`"
            type="warning"
            show-icon
            style="margin-top: 16px"
          />
        </div>

        <div class="result-actions">
          <a-button type="primary" @click="handleViewFile" v-if="result.filePath">
            查看文件
          </a-button>
          <a-button @click="handleContinue">继续处理</a-button>
          <a-button @click="handleReset">重新开始</a-button>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { message } from 'ant-design-vue';
import { InboxOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { useWordNotes } from '../composables/useWordNotes.js';

const {
  currentStep,
  classId,
  taskId,
  totalPages,
  pages,
  pageMeta,
  recognitionProgress,
  recognitionStatus,
  result,
  error,
  uploading,
  recognizing,
  annotatedCount,
  allPagesAnnotated,
  annotationProgress,
  uploadPDF,
  setPageAnnotation,
  batchSetAnnotation,
  startRecognition,
  pollProgress,
  getPageImageUrl,
  reset,
} = useWordNotes();

// 文件上传
const fileList = ref([]);
const currentPageIndex = ref(1);

// 当前页标注
const currentAnnotation = ref({
  date: null,
  session: '',
});

// 轮询定时器
let progressTimer = null;

// 计算属性
const currentPageImageUrl = computed(() => {
  if (currentPageIndex.value && pages.value.length > 0) {
    return getPageImageUrl(currentPageIndex.value);
  }
  return '';
});

// 方法
function beforeUpload(file) {
  const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');
  if (!isPDF) {
    message.error('仅支持 PDF 格式文件！');
    return false;
  }
  const isLt50M = file.size / 1024 / 1024 < 100;
  if (!isLt50M) {
    message.error('文件大小不能超过 100MB！');
    return false;
  }
  return false; // 阻止自动上传
}

async function handleUpload() {
  if (fileList.value.length === 0) {
    message.error('请选择 PDF 文件');
    return;
  }

  if (!classId.value.trim()) {
    message.error('请输入班级ID');
    return;
  }

  try {
    const file = fileList.value[0].originFileObj || fileList.value[0];
    await uploadPDF(file);
    message.success('PDF 上传成功！');
    
    // 初始化第一页的标注
    if (pages.value.length > 0) {
      loadPageAnnotation(1);
    }
  } catch (err) {
    message.error(err.message || '上传失败');
  }
}

function loadPageAnnotation(pageIndex) {
  const meta = pageMeta[pageIndex] || {};
  currentAnnotation.value = {
    date: meta.date || '',
    session: meta.session || '',
  };
}

function normalizeDateValue(dateValue) {
  if (!dateValue) return '';
  if (typeof dateValue === 'string') return dateValue;
  if (dateValue.format) return dateValue.format('YYYY-MM-DD');
  return dayjs(dateValue).format('YYYY-MM-DD');
}

function handleDateChange(date, dateString) {
  const formattedDate = dateString || normalizeDateValue(date);
  currentAnnotation.value.date = formattedDate;
  setPageAnnotation(currentPageIndex.value, formattedDate, currentAnnotation.value.session);
}

function handleSessionChange(e) {
  const sessionValue = e.target.value;
  currentAnnotation.value.session = sessionValue;
  const formattedDate = normalizeDateValue(currentAnnotation.value.date);
  setPageAnnotation(currentPageIndex.value, formattedDate, sessionValue);
}

function handleBatchSet() {
  if (!currentAnnotation.value.date || !currentAnnotation.value.session) {
    message.warning('请先选择日期和时段');
    return;
  }
  
  batchSetAnnotation(
    currentPageIndex.value,
    normalizeDateValue(currentAnnotation.value.date),
    currentAnnotation.value.session
  );
  message.success(`已批量设置第 ${currentPageIndex.value} 页到第 ${totalPages.value} 页的标注`);
}

function goToPreviousPage() {
  if (currentPageIndex.value > 1) {
    currentPageIndex.value--;
    loadPageAnnotation(currentPageIndex.value);
  }
}

function goToNextPage() {
  if (currentPageIndex.value < totalPages.value) {
    currentPageIndex.value++;
    loadPageAnnotation(currentPageIndex.value);
  }
}

async function handleStartRecognition() {
  if (!allPagesAnnotated.value) {
    message.warning('请完成所有页面的标注');
    return;
  }

  try {
    // 开始轮询进度
    startProgressPolling();
    
    await startRecognition();
    message.success('识别完成！');
    stopProgressPolling();
  } catch (err) {
    message.error(err.message || '识别失败');
    stopProgressPolling();
  }
}

function startProgressPolling() {
  stopProgressPolling(); // 先清除之前的定时器
  progressTimer = setInterval(async () => {
    const shouldContinue = await pollProgress();
    if (!shouldContinue) {
      stopProgressPolling();
      if (recognitionStatus.value === 'completed') {
        currentStep.value = 'result';
      }
    }
  }, 2000); // 每2秒查询一次
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
    // 这里可以打开文件预览或下载
    message.info('文件路径: ' + result.value.filePath);
  }
}

function handleContinue() {
  reset();
  fileList.value = [];
  currentPageIndex.value = 1;
  currentAnnotation.value = { date: null, session: '' };
}

function handleReset() {
  reset();
  fileList.value = [];
  currentPageIndex.value = 1;
  currentAnnotation.value = { date: null, session: '' };
  message.info('已重置，可以重新开始');
}

// 监听页面变化
watch(currentPageIndex, (newIndex) => {
  loadPageAnnotation(newIndex);
});

// 组件卸载时清理
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
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
}

.hero-text p {
  margin: 0;
  color: #64748b;
  font-size: 16px;
}

.content-card {
  max-width: 1200px;
  margin: 0 auto;
}

.annotation-header {
  margin-bottom: 24px;
}

.progress-text {
  margin-top: 8px;
  text-align: center;
  color: #64748b;
}

.image-viewer {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  margin: 24px 0;
}

.image-container {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-image {
  max-width: 100%;
  max-height: 600px;
  object-fit: contain;
}

.annotation-form {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 24px;
}

.navigation-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.navigation-buttons button {
  flex: 1;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.progress-container {
  text-align: center;
  padding: 40px;
}

.progress-info {
  margin-top: 24px;
}

.progress-info p {
  margin: 8px 0;
  color: #64748b;
}

.result-container {
  padding: 24px 0;
}

.result-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: center;
}

@media (max-width: 768px) {
  .image-viewer {
    grid-template-columns: 1fr;
  }
}
</style>

