<template>
  <div class="word-note-jobs-page">
    <a-card class="content-card" title="筛选条件">
      <a-form layout="vertical" @submit.prevent>
        <a-row :gutter="16">
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="班级 ID">
              <a-input v-model:value="filters.classId" placeholder="例如：A01" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6">
            <a-form-item label="状态">
              <a-select
                v-model:value="filters.status"
                :options="statusOptions"
                placeholder="全部"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="8">
            <a-form-item label="日期范围">
              <a-range-picker v-model:value="filters.dateRange" format="YYYY-MM-DD" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="4">
            <a-form-item label="任务搜索">
              <a-input-search
                v-model:value="filters.search"
                placeholder="输入任务ID关键字"
                allow-clear
                @search="handleSearch"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <div class="filter-actions">
          <a-button type="primary" @click="handleSearch" :loading="loading">查询</a-button>
          <a-button @click="handleReset" :disabled="loading">重置</a-button>
        </div>
      </a-form>
    </a-card>

    <a-card class="content-card" title="识别记录">
      <a-table
        :columns="columns"
        :data-source="jobs"
        :loading="loading"
        row-key="taskId"
        :pagination="false"
        bordered
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="statusColor(record.status)">{{ statusText(record.status) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'processingTime'">
            {{ record.processingTime ? `${record.processingTime}s` : '-' }}
          </template>
          <template v-else-if="column.key === 'failedPages'">
            {{ record.failedPages }}
            <span v-if="record.failedPageNumbers?.length" class="muted-text">
              ({{ record.failedPageNumbers.join(', ') }})
            </span>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" @click="() => goToDetail(record.taskId)">详情</a-button>
              <a-button
                type="link"
                :disabled="record.status !== 'completed' || !record.hasMarkdown"
                @click="() => goToDetail(record.taskId)"
              >
                查看 Markdown
              </a-button>
            </a-space>
          </template>
          <template v-else>
            {{ record[column.dataIndex] ?? '-' }}
          </template>
        </template>
      </a-table>

      <div class="table-footer">
        <a-pagination
          :current="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          show-size-changer
          @change="handlePageChange"
          @showSizeChange="handlePageChange"
        />
      </div>
    </a-card>

    <a-drawer
      v-model:open="detailVisible"
      :width="720"
      title="任务详情"
      :destroy-on-close="true"
      @close="closeDetail"
    >
      <a-descriptions v-if="detail?.job" bordered :column="2">
        <a-descriptions-item label="任务ID">{{ detail.job.taskId }}</a-descriptions-item>
        <a-descriptions-item label="班级">{{ detail.job.classId }}</a-descriptions-item>
        <a-descriptions-item label="状态">{{ statusText(detail.job.status) }}</a-descriptions-item>
        <a-descriptions-item label="总页数">{{ detail.job.totalPages }}</a-descriptions-item>
        <a-descriptions-item label="识别词条">{{ detail.job.recognizedItems }}</a-descriptions-item>
        <a-descriptions-item label="失败页">{{ detail.job.failedPages }}</a-descriptions-item>
        <a-descriptions-item label="自动补全(日期/时段)">
          {{ detail.job.autoFillDates }} / {{ detail.job.autoFillSessions }}
        </a-descriptions-item>
        <a-descriptions-item label="处理耗时">
          {{ detail.job.processingTime ? `${detail.job.processingTime}s` : '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="Markdown 文件" :span="2">
          <span v-if="detail.job.filePath" class="link" @click="handleViewMarkdown(detail.job.filePath)">
            {{ detail.job.filePath }}
          </span>
          <span v-else class="muted-text">尚未生成</span>
        </a-descriptions-item>
        <a-descriptions-item label="失败原因" :span="2">
          {{ detail.job.errorMessage || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ formatDate(detail.job.createdAt) }}</a-descriptions-item>
        <a-descriptions-item label="更新时间">{{ formatDate(detail.job.updatedAt) }}</a-descriptions-item>
      </a-descriptions>

      <a-divider />

      <div v-if="detail?.pages?.length" class="page-preview-list">
        <h4>页面预览</h4>
        <a-list :data-source="detail.pages" bordered :split="false">
          <template #renderItem="{ item }">
            <a-list-item>
              <div class="page-item">
                <span>第 {{ item.pageIndex }} 页</span>
                <a-button type="link" @click="() => handleViewImage(item.imageUrl)">查看图片</a-button>
              </div>
            </a-list-item>
          </template>
        </a-list>
      </div>
      <a-empty v-else description="暂无页面信息" />
    </a-drawer>
  </div>
</template>

<script setup>
import { message } from 'ant-design-vue';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { useWordNotesJobs } from '../composables/useWordNotesJobs.js';

const route = useRoute();
const router = useRouter();

const statusOptions = [
  { label: '全部', value: undefined },
  { label: '进行中', value: 'processing' },
  { label: '已完成', value: 'completed' },
  { label: '失败', value: 'failed' },
];

const columns = [
  { title: '任务ID', dataIndex: 'taskId', key: 'taskId' },
  { title: '班级', dataIndex: 'classId', key: 'classId' },
  { title: '状态', key: 'status' },
  { title: '总页数', dataIndex: 'totalPages', key: 'totalPages' },
  { title: '识别词条', dataIndex: 'recognizedItems', key: 'recognizedItems' },
  { title: '失败页', key: 'failedPages' },
  { title: '耗时', key: 'processingTime' },
  { title: '创建时间', key: 'createdAt' },
  { title: '操作', key: 'actions' },
];

const {
  filters,
  jobs,
  loading,
  pagination,
  detail,
  detailVisible,
  fetchJobs,
  openDetail,
  closeDetail,
  resetFilters,
  withApiPrefix,
} = useWordNotesJobs();

const statusMap = {
  processing: { text: '进行中', color: 'blue' },
  completed: { text: '已完成', color: 'green' },
  failed: { text: '失败', color: 'red' },
};

const statusText = (status) => statusMap[status]?.text || status || '-';
const statusColor = (status) => statusMap[status]?.color || 'default';

const formatDate = (value) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-');

const handleSearch = async () => {
  const ok = await fetchJobs(1);
  if (!ok) {
    message.error('查询失败，请稍后重试');
  }
};

const handleReset = async () => {
  resetFilters();
  await handleSearch();
};

const handlePageChange = async (page, pageSize) => {
  pagination.pageSize = pageSize;
  const ok = await fetchJobs(page);
  if (!ok) {
    message.error('分页查询失败');
  }
};

const goToDetail = (taskId) => {
  router.push({
    name: 'word-notes-detail',
    params: { taskId },
  });
};

const showDetail = async (taskId) => {
  const ok = await openDetail(taskId);
  if (!ok) {
    message.error('获取详情失败');
  }
};

const handleViewMarkdown = (filePath) => {
  if (!filePath) return;
  const url = withApiPrefix(filePath);
  window.open(url, '_blank');
};

const handleViewImage = (imageUrl) => {
  if (!imageUrl) return;
  window.open(withApiPrefix(imageUrl), '_blank');
};

const init = async () => {
  if (route.query.classId) {
    filters.classId = String(route.query.classId);
  }
  const ok = await fetchJobs(1);
  if (!ok) {
    message.error('加载识别记录失败');
  }
};

onMounted(() => {
  init();
});
</script>

<style scoped>
.word-note-jobs-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24px;
}

.content-card {
  max-width: 1200px;
  margin: 0 auto 24px;
}

.filter-actions {
  display: flex;
  gap: 12px;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.muted-text {
  color: #95a0ab;
  font-size: 12px;
  margin-left: 4px;
}

.link {
  color: #1677ff;
  cursor: pointer;
}

.link:hover {
  text-decoration: underline;
}

.page-preview-list {
  margin-top: 16px;
}

.page-item {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
</style>
