<template>
  <div class="snapshot-list-page">
    <section class="page-hero surface-card">
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
          <a-button
            type="primary"
            size="large"
            :disabled="mergeDisabled"
            @click="goToMerge"
          >
            合并查看
            <span v-if="selectedCount">（已选 {{ selectedCount }} 条）</span>
          </a-button>
          <a-button size="large" @click="loadSnapshots" :loading="loading">刷新列表</a-button>
          <a-button type="primary" size="large" ghost @click="goToSchedule">返回课表制定</a-button>
        </a-space>
      </div>
    </section>

    <section class="content-sections">
      <a-card class="surface-card filter-card" :bordered="false">
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

      <selected-snapshots-bar
        v-if="selectedSnapshots.length"
        :items="selectedSnapshots"
        @remove="removeSelectedSnapshot"
        @clear="clearSelectedSnapshots"
      />

      <a-card class="surface-card data-card" :bordered="false">
        <a-table
          :data-source="snapshots"
          :columns="columns"
          :loading="loading"
          :pagination="false"
          :row-key="(record) => record.id"
          :row-selection="rowSelection"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.key === 'course_total'">
              {{ formatCurrencyTotals(record.course_totals) }}
            </template>
            <template v-else-if="column.key === 'extra_total'">
              {{ formatCurrencyTotals(record.extra_totals) }}
            </template>
            <template v-else-if="column.key === 'total_cost'">
              {{ formatCurrencyTotals(record.grand_totals) }}
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
import SelectedSnapshotsBar from '../components/snapshot/SelectedSnapshotsBar.vue';

const router = useRouter();

dayjs.extend(relativeTime);

const studentOptions = ref([]);
const snapshots = ref([]);
const loading = ref(false);
const selectedRowKeys = ref([]);
const selectedSnapshotsMap = reactive(new Map());

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
  { title: '课程费用', key: 'course_total' },
  { title: '额外费用', key: 'extra_total' },
  { title: '总费用', key: 'total_cost' },
  { title: '创建时间', dataIndex: 'created_at', key: 'created_at' },
  { title: '操作', key: 'actions' },
];

function formatCurrencyAmount(amount) {
  if (!amount) return '0.00';
  return Number(amount).toFixed(2);
}

function formatCurrencySymbol(currency) {
  const symbols = {
    CNY: '¥',
    SGD: 'S$',
    USD: '$',
  };
  return symbols[currency] || currency;
}

function formatCurrencyTotals(totals) {
  if (!totals || !Array.isArray(totals) || totals.length === 0) {
    return '¥0.00';
  }
  return totals
    .map((item) => `${formatCurrencySymbol(item.currency)}${formatCurrencyAmount(item.amount)}`)
    .join(' / ');
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

const selectedSnapshots = computed(() => {
  return Array.from(selectedSnapshotsMap.values()).sort((a, b) => {
    const timeA = dayjs(a.created_at).valueOf();
    const timeB = dayjs(b.created_at).valueOf();
    return timeB - timeA;
  });
});

const selectedCount = computed(() => selectedRowKeys.value.length);

const mergeDisabled = computed(() => selectedCount.value === 0);

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  preserveSelectedRowKeys: true,
  onChange: handleSelectionChange,
}));

function extractSnapshotBrief(item) {
  return {
    id: item.id,
    student_name: item.student_name,
    year_month: item.year_month,
    created_at: item.created_at,
  };
}

function synchronizeSelection(keys) {
  const normalizedKeys = keys.map((key) => (typeof key === 'number' ? key : Number(key)));
  const keySet = new Set(normalizedKeys);

  // 移除未选中的快照
  Array.from(selectedSnapshotsMap.keys()).forEach((id) => {
    if (!keySet.has(id)) {
      selectedSnapshotsMap.delete(id);
    }
  });

  // 将当前页中已选的快照写入缓存
  snapshots.value.forEach((item) => {
    if (keySet.has(item.id)) {
      selectedSnapshotsMap.set(item.id, extractSnapshotBrief(item));
    }
  });

  selectedRowKeys.value = normalizedKeys;
}

function handleSelectionChange(keys) {
  synchronizeSelection(keys);
}

function removeSelectedSnapshot(id) {
  selectedSnapshotsMap.delete(id);
  selectedRowKeys.value = selectedRowKeys.value.filter((key) => key !== id);
}

function clearSelectedSnapshots() {
  selectedSnapshotsMap.clear();
  selectedRowKeys.value = [];
}

function goToMerge() {
  if (!selectedRowKeys.value.length) {
    message.warning('请先选择需要合并的快照');
    return;
  }
  const ids = selectedRowKeys.value.join(',');
  router.push({ name: 'snapshot-merge', query: { ids } });
}

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

    // 刷新缓存中的快照信息
    const currentKeySet = new Set(selectedRowKeys.value);
    snapshots.value.forEach((item) => {
      if (currentKeySet.has(item.id)) {
        selectedSnapshotsMap.set(item.id, extractSnapshotBrief(item));
      }
    });
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
  gap: 24px;
  color: #1f2937;
}

.page-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 32px;
  gap: 32px;
}

.hero-text {
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hero-kicker {
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #5f6b7c;
}

.hero-text h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  color: #102a43;
}

.hero-text p {
  margin: 0;
  font-size: 15px;
  color: #5f6b7c;
}

.hero-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-tags :deep(.ant-tag) {
  border-radius: 999px;
  padding: 4px 14px;
  font-size: 13px;
}

.hero-actions {
  display: flex;
  align-items: flex-end;
}

.content-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  padding: 22px 26px;
}

.data-card :deep(.ant-table) {
  background: transparent;
}

.data-card :deep(.ant-table-thead > tr > th) {
  background: #f1f5f9 !important;
  color: #475569;
  border-color: #e2e8f0;
  font-weight: 600;
}

.data-card :deep(.ant-table-tbody > tr > td) {
  background: #ffffff;
  border-color: #e5e9f0;
  color: #1f2937;
}

.data-card :deep(.ant-table-row:hover > td) {
  background: #f8fafc !important;
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
  padding: 44px 0;
}

.empty-block :deep(.ant-empty-description) {
  color: #6b7280;
}

@media (max-width: 960px) {
  .snapshot-list-page {
    gap: 20px;
  }

  .page-hero {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px 24px;
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
    padding: 22px 18px;
  }

  .filter-card :deep(.ant-card-body),
  .data-card :deep(.ant-card-body) {
    padding: 18px;
  }

  .filter-select {
    min-width: 100%;
  }
}
</style>
