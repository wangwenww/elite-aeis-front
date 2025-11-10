<template>
  <div class="snapshot-list-page">
    <section class="page-hero glass-card">
      <div class="hero-text">
        <span class="hero-kicker">ELITE EDU / SNAPSHOT CENTER</span>
        <h1>课表快照管理</h1>
        <p>统一查看、筛选、导出历史课表，确保每个版本均可追溯。</p>
        <div class="hero-tags">
          <a-tag color="green" :bordered="false">总计 {{ metrics.total }} 条记录</a-tag>
          <a-tag color="blue" :bordered="false">{{ metrics.distinctStudents }} 位学生</a-tag>
          <a-tag color="purple" :bordered="false">最新保存 {{ metrics.latestCreated || '—' }}</a-tag>
        </div>
      </div>
      <div class="hero-actions">
        <a-space>
          <a-button type="primary" size="large" ghost @click="goToSchedule">返回课表制定</a-button>
          <a-button size="large" @click="loadSnapshots" :loading="loading">刷新列表</a-button>
        </a-space>
      </div>
    </section>

    <section class="content-sections">
      <a-card class="glass-card filter-card" :bordered="false">
        <a-form layout="inline" :model="filters" class="filter-form">
          <a-form-item label="学生">
            <a-select
              v-model:value="filters.studentId"
              placeholder="全部学生"
              allow-clear
              class="filter-select"
              :options="studentOptions"
            />
          </a-form-item>
          <a-form-item label="月份">
            <a-date-picker
              v-model:value="filters.yearMonth"
              picker="month"
              allow-clear
              placeholder="全部月份"
              class="filter-select"
            />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="loadSnapshots" :loading="loading">查询</a-button>
              <a-button @click="resetFilters">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>

      <a-card class="glass-card data-card" :bordered="false">
        <a-table
          :data-source="snapshots"
          :columns="columns"
          :loading="loading"
          :pagination="false"
          row-key="record => record.id"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.key === 'course_total' || column.key === 'extra_total' || column.key === 'total_cost'">
              ¥{{ formatCurrency(text) }}
            </template>
            <template v-else-if="column.key === 'created_at'">
              {{ formatDate(text) }}
            </template>
            <template v-else-if="column.key === 'actions'">
              <a-space>
                <a-button type="link" @click="viewSnapshot(record.id)">查看</a-button>
                <a-button type="link" danger @click="confirmDelete(record)">删除</a-button>
              </a-space>
            </template>
            <template v-else>
              {{ text }}
            </template>
          </template>
          <template #emptyText>
            <div class="empty-block">
              <a-empty description="暂无快照记录">
                <template #description>
                  <span>尚未生成快照，可先在“课表制定”页面保存课表。</span>
                </template>
              </a-empty>
            </div>
          </template>
        </a-table>

        <div class="pagination-wrapper">
          <a-pagination
            :current="pagination.current"
            :page-size="pagination.pageSize"
            :total="pagination.total"
            :show-size-changer="true"
            :page-size-options="['10', '20', '50']"
            @change="handlePageChange"
            @showSizeChange="handlePageSizeChange"
          />
        </div>
      </a-card>
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import http from '../api/http';

const router = useRouter();

dayjs.extend(relativeTime);

const studentOptions = ref([]);
const snapshots = ref([]);
const loading = ref(false);

const filters = reactive({
  studentId: undefined,
  yearMonth: undefined,
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const columns = [
  { title: '学生', dataIndex: 'student_name', key: 'student_name' },
  { title: '月份', dataIndex: 'year_month', key: 'year_month' },
  { title: '课程费用', dataIndex: 'course_total', key: 'course_total' },
  { title: '额外费用', dataIndex: 'extra_total', key: 'extra_total' },
  { title: '总费用', dataIndex: 'total_cost', key: 'total_cost' },
  { title: '创建时间', dataIndex: 'created_at', key: 'created_at' },
  { title: '操作', key: 'actions' },
];

function formatCurrency(value) {
  if (!value) return '0.00';
  return Number(value).toFixed(2);
}

function formatDate(value) {
  if (!value) return '--';
  return dayjs(value).format('YYYY-MM-DD HH:mm');
}

const metrics = computed(() => {
  const total = pagination.total || 0;
  const distinctStudents = new Set(snapshots.value.map((item) => item.student_id)).size;
  const latest = snapshots.value
    .map((item) => item.created_at)
    .filter(Boolean)
    .sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf())[0];
  return {
    total,
    distinctStudents,
    latestCreated: latest ? dayjs(latest).fromNow() : '',
  };
});

async function loadStudents() {
  try {
    const { data } = await http.get('/api/students');
    studentOptions.value = (data.students || []).map((item) => ({ label: item.name, value: item.id }));
  } catch (error) {
    message.error(`加载学生列表失败：${error.message}`);
  }
}

async function loadSnapshots() {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      page_size: pagination.pageSize,
    };
    if (filters.studentId) params.student_id = filters.studentId;
    if (filters.yearMonth) params.year_month = filters.yearMonth.format('YYYY-MM');

    const { data } = await http.get('/api/schedule-snapshots', { params });
    snapshots.value = (data.items || []).map((item) => ({
      ...item,
    }));
    pagination.total = data.total || 0;
  } catch (error) {
    message.error(`加载快照失败：${error.message}`);
  } finally {
    loading.value = false;
  }
}

function handlePageChange(page) {
  pagination.current = page;
  loadSnapshots();
}

function handlePageSizeChange(current, size) {
  pagination.pageSize = size;
  pagination.current = 1;
  loadSnapshots();
}

function resetFilters() {
  filters.studentId = undefined;
  filters.yearMonth = undefined;
  pagination.current = 1;
  loadSnapshots();
}

function viewSnapshot(id) {
  router.push({ name: 'snapshot-detail', params: { id } });
}

function confirmDelete(record) {
  Modal.confirm({
    title: '删除快照',
    content: `确定删除该快照（学生：${record.student_name}，月份：${record.year_month}）吗？删除后无法恢复。`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await http.delete(`/api/schedule-snapshots/${record.id}`);
        message.success('快照已删除');
        loadSnapshots();
      } catch (error) {
        message.error(`删除失败：${error.message}`);
      }
    },
  });
}

function goToSchedule() {
  router.push({ name: 'schedule' });
}

onMounted(async () => {
  await loadStudents();
  await loadSnapshots();
});
</script>

<style scoped>
.snapshot-list-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
  color: #e2e8f0;
}

.glass-card {
  background: linear-gradient(150deg, rgba(15, 23, 42, 0.78), rgba(17, 24, 39, 0.86));
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(8, 18, 46, 0.55);
  color: #e2e8f0;
}

.page-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 36px;
  gap: 32px;
  position: relative;
  overflow: hidden;
}

.page-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(82, 196, 26, 0.28), transparent 55%);
  pointer-events: none;
}

.hero-text {
  position: relative;
  z-index: 1;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hero-kicker {
  font-size: 13px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.75);
}

.hero-text h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  color: #f8fafc;
}

.hero-text p {
  margin: 0;
  font-size: 15px;
  color: rgba(226, 232, 240, 0.75);
}

.hero-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-tags :deep(.ant-tag) {
  border-radius: 999px;
  padding: 4px 16px;
  font-size: 13px;
}

.hero-actions {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
}

.content-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.filter-select {
  min-width: 210px;
}

.filter-card :deep(.ant-card-body),
.data-card :deep(.ant-card-body) {
  padding: 24px 28px;
}

.data-card :deep(.ant-table) {
  background: transparent;
}

.data-card :deep(.ant-table-thead > tr > th) {
  background: rgba(15, 23, 42, 0.9) !important;
  color: rgba(226, 232, 240, 0.8);
  border-color: rgba(148, 163, 184, 0.18);
  font-weight: 600;
}

.data-card :deep(.ant-table-tbody > tr > td) {
  background: rgba(15, 23, 42, 0.65);
  border-color: rgba(148, 163, 184, 0.12);
  color: #e2e8f0;
}

.data-card :deep(.ant-table-row:hover > td) {
  background: rgba(51, 65, 85, 0.55) !important;
}

.data-card :deep(.ant-table-pagination) {
  margin: 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.empty-block {
  padding: 48px 0;
}

.empty-block :deep(.ant-empty-description) {
  color: rgba(226, 232, 240, 0.7);
}

@media (max-width: 960px) {
  .snapshot-list-page {
    gap: 24px;
  }

  .page-hero {
    flex-direction: column;
    align-items: flex-start;
    padding: 28px 24px;
  }

  .hero-actions {
    align-self: stretch;
    justify-content: flex-start;
  }

  .filter-form {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 576px) {
  .page-hero {
    padding: 24px 18px;
  }

  .filter-card :deep(.ant-card-body),
  .data-card :deep(.ant-card-body) {
    padding: 20px;
  }

  .filter-select {
    min-width: 100%;
  }
}
</style>
