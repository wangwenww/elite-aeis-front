<template>
  <div class="snapshot-merge-page">
    <a-spin :spinning="loading">
      <div v-if="snapshots.length" class="page-content">
        <merged-snapshot-header
          :students="studentNames"
          :months="monthList"
          :month-summary="monthSummary"
          :totals="headerTotals"
        />

        <div class="merge-content">
          <section class="months-stack">
            <merged-month-section
              v-for="snapshot in snapshots"
              :key="snapshot.id"
              :snapshot="snapshot"
              :format-totals="formatTotalsList"
              :format-amount="formatAmount"
            />
          </section>

          <temporary-adjustments-panel
            :adjustments="temporaryAdjustments"
            :format-amount="formatAmount"
            @add="handleAddAdjustment"
            @remove="handleRemoveAdjustment"
          />

          <merged-totals-panel
            :course-totals="aggregatedCourseTotals"
            :extra-totals="aggregatedExtraTotals"
            :adjustment-totals="adjustmentTotals"
            :final-totals="combinedTotals"
            :format-amount="formatAmount"
            @preview="openPreview"
            @back="goBack"
          />
        </div>
      </div>

      <a-empty v-else description="请选择需要合并的快照" />
    </a-spin>

    <a-modal
      v-model:visible="previewVisible"
      width="900px"
      :footer="null"
      destroy-on-close
      title="合并费用预览"
    >
      <div class="invoice-preview" v-if="snapshots.length">
        <div class="invoice-sheet" ref="invoicePreviewRef">
          <div class="invoice-green-header">
            <div class="invoice-header-left">
              <img :src="logoUrl" alt="Elite Edu Logo" class="invoice-logo" />
            </div>
            <div class="invoice-header-right">
              <div class="invoice-title">Elite Edu</div>
              <div class="invoice-subtitle">Tuition</div>
            </div>
          </div>

          <div class="invoice-meta-header">
            <div>
              <h2>费用清单总计</h2>
              <p>账期：{{ monthSummary || '—' }}</p>
            </div>
            <div class="invoice-meta-list">
              <span>学生：{{ studentNames.join('、') || '—' }}</span>
<!--              <span>生成时间：{{ formatDate(new Date()) }}</span>-->
<!--              <span>快照数量：{{ snapshots.length }}</span>-->
            </div>
          </div>

          <div class="invoice-body">
            <section
              class="invoice-block"
              v-for="snapshot in snapshots"
              :key="`preview-${snapshot.id}`"
            >
              <header class="block-header">
                <div>
                  <h3>{{ snapshot.year_month }} · {{ snapshot.student_name || '未命名学生' }}</h3>
<!--                  <p>快照创建时间：{{ formatDate(snapshot.created_at) }}</p>-->
                </div>
                <a-tag color="blue" :bordered="false">
                  应付：{{ formatTotalsList(snapshot.statistics.grand_totals) }}
                </a-tag>
              </header>

              <div class="block-content">
                <h4>课程费用</h4>
                <table class="invoice-table">
                  <thead>
                    <tr>
                      <th>课程名称</th>
                      <th>上课时间</th>
                      <th>课时数</th>
                      <th>单价</th>
                      <th>小计</th>
                      <th>币种</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="course in snapshot.statistics.course_statistics"
                      :key="`course-${snapshot.id}-${course.course_name}-${course.currency}`"
                    >
                      <td>{{ course.course_name }}</td>
                      <td>{{ deriveCourseTime(snapshot, course) }}</td>
                      <td>{{ course.count }}</td>
                      <td>{{ formatAmount(course.price_per_class, course.currency) }}</td>
                      <td>{{ formatAmount(course.total, course.currency) }}</td>
                      <td>{{ course.currency }}</td>
                    </tr>
                    <tr v-if="!snapshot.statistics.course_statistics.length">
                      <td colspan="6" class="empty-cell">本月无课程费用记录</td>
                    </tr>
                  </tbody>
                </table>

                <div class="block-subtotals">
                  <div>
                    <span>课程小计</span>
                    <strong>{{ formatTotalsList(snapshot.statistics.course_totals) }}</strong>
                  </div>
                  <div>
                    <span>额外费用</span>
                    <strong>{{ formatTotalsList(snapshot.statistics.extra_totals) }}</strong>
                  </div>
                  <div>
                    <span>本月应付</span>
                    <strong>{{ formatTotalsList(snapshot.statistics.grand_totals) }}</strong>
                  </div>
                </div>

                <div class="extra-section">
                  <h4>额外费用</h4>
                  <table class="invoice-table">
                    <thead>
                      <tr>
                        <th>名称</th>
                        <th>日期</th>
                        <th>金额</th>
                        <th>币种</th>
                        <th>备注</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="item in snapshot.statistics.extra_expenses"
                        :key="`extra-${snapshot.id}-${item.name}-${item.expense_date}`"
                      >
                        <td>{{ item.name }}</td>
                        <td>{{ item.expense_date }}</td>
                        <td>{{ formatAmount(item.amount, item.currency) }}</td>
                        <td>{{ item.currency }}</td>
                        <td>{{ item.notes || '—' }}</td>
                      </tr>
                      <tr v-if="!snapshot.statistics.extra_expenses.length">
                        <td colspan="5" class="empty-cell">本月无额外费用记录</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section class="invoice-block" v-if="temporaryAdjustments.length">
              <header class="block-header">
                <div>
                  <h3>临时费用调整</h3>
                  <p>包括手动添加的补收费或折扣扣减</p>
                </div>
              </header>
              <table class="invoice-table">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>日期</th>
                    <th>金额</th>
                    <th>币种</th>
                    <th>备注</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in temporaryAdjustments" :key="item.uid">
                    <td>{{ item.name }}</td>
                    <td>{{ item.date }}</td>
                    <td>{{ formatAmount(item.amount, item.currency) }}</td>
                    <td>{{ item.currency }}</td>
                    <td>{{ item.notes || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section class="invoice-block invoice-grand">
              <header class="block-header">
                <div>
                  <h3>最终汇总</h3>
                  <p>按币种归并所有月份的课程费用、额外费用及临时调整</p>
                </div>
              </header>
              <table class="invoice-table">
                <thead>
                  <tr>
                    <th>类别</th>
                    <th>金额</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in courseTotalRows" :key="`final-course-${item.currency}`">
                    <td>课程费用合计（{{ item.currency }}）</td>
                    <td>{{ formatAmount(item.amount, item.currency) }}</td>
                  </tr>
                  <tr v-for="item in extraTotalRows" :key="`final-extra-${item.currency}`">
                    <td>原额外费用合计（{{ item.currency }}）</td>
                    <td>{{ formatAmount(item.amount, item.currency) }}</td>
                  </tr>
                  <tr v-if="!adjustmentTotals.length">
                    <td>临时调整合计（CNY）</td>
                    <td>{{ formatAmount(0, 'CNY') }}</td>
                  </tr>
                  <tr v-for="item in adjustmentTotals" :key="`final-adjust-${item.currency}`">
                    <td>临时调整合计（{{ item.currency }}）</td>
                    <td>{{ formatAmount(item.amount, item.currency) }}</td>
                  </tr>
                  <tr class="grand-row" v-for="item in finalTotalRows" :key="`final-grand-${item.currency}`">
                    <td>最终应付总额（{{ item.currency }}）</td>
                    <td>{{ formatAmount(item.amount, item.currency) }}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        </div>

        <div class="invoice-actions">
          <a-space>
            <a-button @click="previewVisible = false">关闭</a-button>
            <a-button type="primary" :loading="exporting" @click="handleExportPreview">
              导出PDF
            </a-button>
          </a-space>
        </div>
      </div>
      <a-empty v-else description="暂无可预览内容" />
    </a-modal>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import MergedSnapshotHeader from '../components/snapshot/MergedSnapshotHeader.vue';
import MergedMonthSection from '../components/snapshot/MergedMonthSection.vue';
import TemporaryAdjustmentsPanel from '../components/snapshot/TemporaryAdjustmentsPanel.vue';
import MergedTotalsPanel from '../components/snapshot/MergedTotalsPanel.vue';
import { useSnapshotMerge } from '../composables/useSnapshotMerge';

const route = useRoute();
const router = useRouter();
const previewVisible = ref(false);
const invoicePreviewRef = ref(null);
const logoUrl = new URL('../assets/elite-logo.png', import.meta.url).href;

const {
  snapshots,
  loading,
  exporting,
  temporaryAdjustments,
  loadSnapshotsByIds,
  addAdjustment,
  removeAdjustment: removeAdjustmentEntry,
  aggregatedCourseTotals,
  aggregatedExtraTotals,
  adjustmentTotals,
  combinedTotals,
  formatAmount,
  formatTotalsList,
  exportMergedPdf,
} = useSnapshotMerge();

const snapshotIds = computed(() => {
  const idsParam = route.query.ids;
  if (!idsParam) return [];
  return String(idsParam)
    .split(',')
    .map((item) => Number(item))
    .filter((id) => !Number.isNaN(id) && id > 0);
});

const studentNames = computed(() => {
  const set = new Set();
  snapshots.value.forEach((item) => {
    if (item.student_name) set.add(item.student_name);
  });
  return Array.from(set);
});

const monthList = computed(() => snapshots.value.map((item) => item.year_month));

const monthSummary = computed(() => snapshots.value.map((item) => item.year_month).join('、'));

const headerTotals = computed(() => [
  {
    label: '课程费用合计',
    value: formatTotalsList(aggregatedCourseTotals.value),
  },
  {
    label: '原额外费用合计',
    value: formatTotalsList(aggregatedExtraTotals.value),
  },
  {
    label: '临时调整合计',
    value: formatTotalsList(adjustmentTotals.value),
  },
  {
    label: '最终应付总额',
    value: formatTotalsList(combinedTotals.value),
    highlight: true,
  },
]);

const courseTotalRows = computed(() =>
  aggregatedCourseTotals.value.length
    ? aggregatedCourseTotals.value
    : [{ currency: 'CNY', amount: 0 }],
);

const extraTotalRows = computed(() =>
  aggregatedExtraTotals.value.length
    ? aggregatedExtraTotals.value
    : [{ currency: 'CNY', amount: 0 }],
);

const finalTotalRows = computed(() =>
  combinedTotals.value.length ? combinedTotals.value : [{ currency: 'CNY', amount: 0 }],
);

function ensureIdsOrRedirect() {
  if (!snapshotIds.value.length) {
    message.warning('请先在快照列表中选择需要合并的记录');
    router.push({ name: 'snapshot-list' });
    return false;
  }
  return true;
}

async function fetchData() {
  if (!ensureIdsOrRedirect()) return;
  try {
    await loadSnapshotsByIds(snapshotIds.value);
  } catch {
    router.push({ name: 'snapshot-list' });
  }
}

function handleAddAdjustment(payload) {
  const success = addAdjustment({
    ...payload,
    amount: payload.amount,
  });
  if (success) {
    message.success('临时调整已添加');
  }
}

watch(
  () => route.query.ids,
  () => {
    fetchData();
  },
);

onMounted(() => {
  fetchData();
});

function handleRemoveAdjustment(uid) {
  removeAdjustmentEntry(uid);
  message.success('已移除临时调整');
}

function goBack() {
  router.push({ name: 'snapshot-list' });
}

function openPreview() {
  if (!snapshots.value.length) {
    message.warning('暂无可预览的快照数据');
    return;
  }
  previewVisible.value = true;
}

async function handleExportPreview() {
  if (!invoicePreviewRef.value) {
    message.error('预览内容尚未准备就绪，请稍后再试');
    return;
  }
  await nextTick();
  const months = monthSummary.value || '账单';
  const filename = `合并账单_${months.replace(/、/g, '_')}.pdf`;
  await exportMergedPdf(invoicePreviewRef.value, filename);
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function deriveCourseTime(snapshot, course) {
  if (course?.course_time) return course.course_time;
  const lessonsMap = snapshot?.schedule_data?.lessons || {};
  for (const entries of Object.values(lessonsMap)) {
    if (!Array.isArray(entries)) continue;
    for (const lesson of entries) {
      if (!lesson || !lesson.course_time) continue;
      if (
        (course.course_id != null && lesson.course_id === course.course_id) ||
        (course.course_name && lesson.course_name === course.course_name)
      ) {
        return lesson.course_time;
      }
    }
  }
  return '—';
}
</script>

<style scoped>
/* CSS变量定义 */
:root {
  --primary-gradient: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.snapshot-merge-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
  color: #1E293B;
  background: linear-gradient(to bottom, #F8FAFC 0%, #F1F5F9 100%);
  min-height: 100vh;
  padding: 24px;
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
  animation: fadeInUp 0.6s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.merge-content {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.months-stack {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 发票预览 */
.invoice-preview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.invoice-sheet {
  width: 794px;
  margin: 0 auto;
  background: #ffffff;
  color: #1E293B;
  padding: 36px 40px;
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
}

.invoice-green-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-radius: 12px;
  padding: 24px 28px;
  color: #ffffff;
  margin-bottom: 28px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.invoice-logo {
  height: 50px;
}

.invoice-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.invoice-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}

.invoice-meta-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
}

.invoice-meta-header h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: #1E293B;
  letter-spacing: -0.02em;
}

.invoice-meta-header p {
  margin: 6px 0 0;
  color: #64748B;
  font-size: 14px;
}

.invoice-meta-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #64748B;
}

.invoice-body {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.invoice-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.invoice-block:hover {
  box-shadow: var(--shadow-sm);
}

.invoice-grand {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(99, 102, 241, 0.08));
  border-color: rgba(37, 99, 235, 0.3);
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.block-header h3 {
  margin: 0;
  font-size: 19px;
  font-weight: 600;
  color: #1E293B;
}

.block-header p {
  margin: 6px 0 0;
  color: #64748B;
  font-size: 13px;
}

.block-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.block-content h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1E293B;
}

/* 表格样式 */
.invoice-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

.invoice-table thead {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

.invoice-table th,
.invoice-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  font-size: 13px;
  color: #1E293B;
}

.invoice-table th {
  font-weight: 600;
  color: #334155;
}

.invoice-table tbody tr {
  transition: all 0.2s ease;
}

.invoice-table tbody tr:hover {
  background: #f8fafc;
}

.invoice-table tbody tr:last-child td {
  border-bottom: none;
}

.empty-cell {
  text-align: center;
  color: #94a3b8;
  font-style: italic;
  padding: 12px;
  font-size: 12px;
}

.block-subtotals {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}

.block-subtotals div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
  color: #1E293B;
  transition: all 0.2s ease;
}

.block-subtotals div:hover {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.block-subtotals strong {
  font-size: 14px;
  font-weight: 700;
  color: #2563eb;
}

.extra-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.extra-section h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1E293B;
}

.invoice-table .grand-row td {
  font-weight: 700;
  color: #2563eb;
  font-size: 14px;
}

.invoice-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 全局按钮优化 */
:deep(.ant-btn) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.ant-btn:hover) {
  transform: translateY(-1px);
}

:deep(.ant-btn:active) {
  transform: scale(0.98);
}

:deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

:deep(.ant-btn-primary:hover) {
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

/* Tag 优化 */
:deep(.ant-tag) {
  border-radius: 6px;
  border: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.ant-tag:hover) {
  transform: scale(1.05);
}

/* Spin 加载效果 */
:deep(.ant-spin) {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Empty 状态 */
:deep(.ant-empty) {
  padding: 60px 0;
}

:deep(.ant-empty-description) {
  color: #64748B;
}

/* 模态框优化 */
:deep(.ant-modal-content) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

:deep(.ant-modal-header) {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-bottom: 2px solid #e2e8f0;
  padding: 20px 24px;
}

:deep(.ant-modal-title) {
  font-size: 18px;
  font-weight: 600;
  color: #1E293B;
}

:deep(.ant-modal-body) {
  padding: 28px 24px;
}

/* 响应式 */
@media (max-width: 900px) {
  .invoice-sheet {
    width: 100%;
    padding: 28px;
  }
}

@media (max-width: 768px) {
  .snapshot-merge-page {
    gap: 24px;
    padding: 16px;
  }

  .invoice-meta-header {
    flex-direction: column;
  }

  .block-subtotals {
    grid-template-columns: 1fr;
  }
}
</style>

