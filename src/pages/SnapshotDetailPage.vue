<template>
  <div class="snapshot-detail-page">
    <template v-if="snapshotInfo">
      <section class="page-hero glass-card">
        <div class="hero-main">
          <div class="hero-text">
            <span class="hero-kicker">ELITE EDU / SNAPSHOT</span>
            <h1>{{ snapshotInfo.student_name || '课表快照详情' }}</h1>
            <p>定格 {{ snapshotInfo.year_month }} 的课程安排与费用，确保每一次调整都可追溯。</p>
            <div class="hero-tags">
              <a-tag color="blue" :bordered="false">月份 {{ snapshotInfo.year_month }}</a-tag>
              <a-tag color="green" :bordered="false">保存于 {{ formatDate(snapshotInfo.created_at) }}</a-tag>
              <a-tag color="purple" :bordered="false">快照编号 {{ invoiceNumber }}</a-tag>
            </div>
          </div>
          <div class="hero-actions">
            <a-space>
              <a-button size="large" @click="goBack">返回快照列表</a-button>
              <a-button type="primary" size="large" :loading="exporting" @click="openPreview">
                费用导出预览
              </a-button>
            </a-space>
          </div>
        </div>
        <div class="hero-metrics">
          <div class="metric-card">
            <span class="metric-label">课程费用</span>
            <span class="metric-value">¥{{ formatCurrency(statistics.course_total) }}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">额外费用</span>
            <span class="metric-value">¥{{ formatCurrency(statistics.extra_total) }}</span>
          </div>
          <div class="metric-card highlight">
            <span class="metric-label">应付总额</span>
            <span class="metric-value">¥{{ formatCurrency(statistics.total_cost) }}</span>
          </div>
        </div>
      </section>

      <div class="content-grid">
        <a-card class="glass-card summary-card" :bordered="false">
          <a-descriptions :column="3" bordered size="small">
            <a-descriptions-item label="学生">{{ snapshotInfo.student_name || '未命名学生' }}</a-descriptions-item>
            <a-descriptions-item label="月份">{{ snapshotInfo.year_month }}</a-descriptions-item>
            <a-descriptions-item label="保存时间">{{ formatDate(snapshotInfo.created_at) }}</a-descriptions-item>
            <a-descriptions-item label="课程费用">¥{{ formatCurrency(statistics.course_total) }}</a-descriptions-item>
            <a-descriptions-item label="额外费用">¥{{ formatCurrency(statistics.extra_total) }}</a-descriptions-item>
            <a-descriptions-item label="总费用">¥{{ formatCurrency(statistics.total_cost) }}</a-descriptions-item>
          </a-descriptions>
        </a-card>

        <div class="layout">
          <a-card class="glass-card calendar-card" :bordered="false">
            <template #title>
              <div class="card-title">
                <span class="card-icon">📅</span>
                <span>课程日历概览</span>
              </div>
            </template>
            <div class="calendar-grid">
              <div class="calendar-header" v-for="dayLabel in weekDays" :key="dayLabel">{{ dayLabel }}</div>
              <div
                v-for="day in flatCalendar"
                :key="day.key"
                class="calendar-cell"
                :class="{ 'is-today': day.isToday, 'is-other-month': !day.inCurrentMonth }"
              >
                <div class="cell-header">
                  <span class="cell-date" :class="{ weekend: day.isWeekend }">{{ day.display }}</span>
                </div>
                <div v-if="day.classes.length" class="cell-classes">
                  <a-tag v-for="cls in day.classes" :key="cls.uid" :color="getCourseColor(cls.course_css_class)" class="class-tag">
                    <div class="class-tag-text">
                      <strong>{{ cls.course_name }}</strong>
                      <span>{{ cls.course_time }}</span>
                    </div>
                  </a-tag>
                </div>
                <div v-else class="cell-empty">无课程</div>
              </div>
            </div>
          </a-card>

          <div class="side-panels">
            <a-card class="glass-card stats-card" :bordered="false">
              <template #title>
                <div class="card-title">
                  <span class="card-icon">📊</span>
                  <span>课程费用统计</span>
                </div>
              </template>
              <a-table
                :data-source="statistics.course_statistics"
                :columns="courseColumns"
                size="small"
                :pagination="false"
                row-key="record => record.course_name"
              >
                <template #bodyCell="{ column, text }">
                  <template v-if="column.key === 'price_per_class' || column.key === 'total'">
                    ¥{{ formatCurrency(text) }}
                  </template>
                  <template v-else>
                    {{ text }}
                  </template>
                </template>
              </a-table>
            </a-card>

            <a-card class="glass-card stats-card" :bordered="false">
              <template #title>
                <div class="card-title">
                  <span class="card-icon">🧾</span>
                  <span>额外费用清单</span>
                </div>
              </template>
              <a-table
                :data-source="extraExpenses"
                :columns="extraColumns"
                size="small"
                :pagination="false"
                row-key="record => record.uid"
              >
                <template #bodyCell="{ column, text }">
                  <template v-if="column.key === 'amount'">
                    ¥{{ formatCurrency(text) }}
                  </template>
                  <template v-else>
                    {{ text }}
                  </template>
                </template>
              </a-table>
            </a-card>
          </div>
        </div>
      </div>
    </template>

    <a-empty v-else description="正在加载快照..." />

    <a-modal
      v-model:visible="previewVisible"
      width="860px"
      title="费用预览"
      :footer="null"
      destroy-on-close
    >
      <div class="invoice-preview" v-if="snapshotInfo">
        <div class="invoice-sheet" ref="invoicePreviewRef">
          <div class="invoice-header">
            <div>
              <h2>School Fee Invoice</h2>
              <p>课程缴费单</p>
            </div>
            <div class="invoice-meta">
              <div><span>Invoice Serial：</span>{{ invoiceNumber }}</div>
              <div><span>Issue Date：</span>{{ formatDate(snapshotInfo.created_at, 'YYYY-MM-DD') }}</div>
            </div>
          </div>

          <a-descriptions :column="1" size="small" bordered>
            <a-descriptions-item label="Student Name / 学生姓名">{{ snapshotInfo.student_name }}</a-descriptions-item>
            <a-descriptions-item label="Month / 月份">{{ snapshotInfo.year_month }}</a-descriptions-item>
          </a-descriptions>

          <div class="invoice-section">
            <h3>Payment Details / 付款明细</h3>
            <a-table
              :data-source="statistics.course_statistics"
              :columns="invoiceCourseColumns"
              :pagination="false"
              size="small"
              row-key="record => record.course_name"
            >
              <template #bodyCell="{ column, text }">
                <template v-if="column.key === 'price_per_class' || column.key === 'total'">
                  ¥{{ formatCurrency(text) }}
                </template>
                <template v-else>
                  {{ text }}
                </template>
              </template>
            </a-table>
          </div>

          <div class="invoice-section" v-if="statistics.extra_expenses?.length">
            <h3>Additional Charges / 额外费用</h3>
            <a-table
              :data-source="statistics.extra_expenses"
              :columns="invoiceExtraColumns"
              :pagination="false"
              size="small"
              row-key="record => record.uid || `${record.name}-${record.expense_date}`"
            >
              <template #bodyCell="{ column, text }">
                <template v-if="column.key === 'amount'">
                  ¥{{ formatCurrency(text) }}
                </template>
                <template v-else>
                  {{ text }}
                </template>
              </template>
            </a-table>
          </div>

          <div class="invoice-summary">
            <div class="summary-row">
              <span>Course Total / 课程费用</span>
              <span>¥{{ formatCurrency(statistics.course_total) }}</span>
            </div>
            <div class="summary-row">
              <span>Additional Total / 额外费用</span>
              <span>¥{{ formatCurrency(statistics.extra_total) }}</span>
            </div>
            <div class="summary-row grand">
              <span>Grand Total / 应付总额</span>
              <span>¥{{ formatCurrency(statistics.total_cost) }}</span>
            </div>
          </div>
        </div>

        <div class="invoice-actions">
          <a-space>
            <a-button @click="previewVisible = false">关闭</a-button>
            <a-button type="primary" :loading="exporting" @click="exportSnapshot">导出PDF</a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { message } from 'ant-design-vue';
import http from '../api/http';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const route = useRoute();
const router = useRouter();
const snapshotId = route.params.id;

const snapshotInfo = ref(null);
const lessonsMap = reactive({});
const extraExpenses = ref([]);
const statistics = reactive({
  course_statistics: [],
  course_total: 0,
  extra_expenses: [],
  extra_total: 0,
  total_cost: 0,
});

const previewVisible = ref(false);
const exporting = ref(false);
const invoicePreviewRef = ref(null);

const weekDays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

const courseColumns = [
  { title: '课程名称', dataIndex: 'course_name', key: 'course_name' },
  { title: '课时数', dataIndex: 'count', key: 'count' },
  { title: '单价', dataIndex: 'price_per_class', key: 'price_per_class' },
  { title: '小计', dataIndex: 'total', key: 'total' },
];

const extraColumns = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '日期', dataIndex: 'expense_date', key: 'expense_date' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  { title: '备注', dataIndex: 'notes', key: 'notes' },
];

const invoiceCourseColumns = [
  { title: 'Description', dataIndex: 'course_name', key: 'course_name' },
  { title: 'Unit Price (SGD)', dataIndex: 'price_per_class', key: 'price_per_class' },
  { title: 'Quantity', dataIndex: 'count', key: 'count' },
  { title: 'Total (SGD)', dataIndex: 'total', key: 'total' },
];

const invoiceExtraColumns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Date', dataIndex: 'expense_date', key: 'expense_date' },
  { title: 'Amount (SGD)', dataIndex: 'amount', key: 'amount' },
  { title: 'Notes', dataIndex: 'notes', key: 'notes' },
];

const selectedMonth = computed(() => {
  const ym = snapshotInfo.value?.year_month || dayjs().format('YYYY-MM');
  return dayjs(ym, 'YYYY-MM');
});

const calendarMatrix = computed(() => {
  const ym = selectedMonth.value;
  if (!ym.isValid()) return [];
  const startOfMonth = ym.startOf('month');
  const endOfMonth = ym.endOf('month');

  const weeks = [];
  let currentWeek = [];

  const startWeekday = (startOfMonth.day() + 6) % 7;
  for (let i = startWeekday; i > 0; i -= 1) {
    const dateObj = startOfMonth.subtract(i, 'day');
    currentWeek.push(createCalendarCell(dateObj, false));
  }

  let cursor = startOfMonth;
  while (cursor.isBefore(endOfMonth) || cursor.isSame(endOfMonth, 'day')) {
    currentWeek.push(createCalendarCell(cursor, true));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    cursor = cursor.add(1, 'day');
  }

  if (currentWeek.length) {
    const remaining = 7 - currentWeek.length;
    for (let i = 0; i < remaining; i += 1) {
      const dateObj = endOfMonth.add(i + 1, 'day');
      currentWeek.push(createCalendarCell(dateObj, false));
    }
    weeks.push(currentWeek);
  }

  return weeks;
});

const flatCalendar = computed(() => calendarMatrix.value.flat());

const invoiceNumber = computed(() => {
  if (!snapshotInfo.value) return '';
  return `SNAP-${String(snapshotInfo.value.id).padStart(6, '0')}`;
});

function createCalendarCell(dateObj, inCurrentMonth) {
  const dateStr = dateObj.format('YYYY-MM-DD');
  return {
    key: `${dateStr}-${inCurrentMonth ? 'in' : 'out'}`,
    date: dateStr,
    display: dateObj.date(),
    inCurrentMonth,
    isToday: dateObj.isSame(dayjs(), 'day'),
    isWeekend: [0, 6].includes(dateObj.day()),
    classes: inCurrentMonth ? getLessonsForDate(dateStr) : [],
  };
}

function getLessonsForDate(dateStr) {
  const items = lessonsMap[dateStr];
  if (!Array.isArray(items)) return [];
  return items;
}

function getCourseColor(cssClass) {
  const map = {
    blue: 'blue',
    green: 'green',
    orange: 'orange',
    pink: 'pink',
    purple: 'purple',
  };
  return map[cssClass] || 'blue';
}

function formatCurrency(value) {
  if (!value) return '0.00';
  return Number(value).toFixed(2);
}

function formatDate(value, format = 'YYYY-MM-DD HH:mm') {
  if (!value) return '--';
  return dayjs(value).format(format);
}

async function fetchSnapshot() {
  try {
    const { data } = await http.get(`/api/schedule-snapshot-item/${snapshotId}`);
    snapshotInfo.value = data;

    Object.keys(lessonsMap).forEach((key) => delete lessonsMap[key]);
    const lessons = data.schedule_data?.lessons || {};
    Object.entries(lessons).forEach(([dateStr, items]) => {
      lessonsMap[dateStr] = (items || []).map((item) => ({
        uid: item.uid,
        course_id: item.course_id,
        course_name: item.course_name,
        course_time: item.course_time,
        course_price: item.course_price,
        course_css_class: item.course_css_class || 'blue',
      }));
    });

    extraExpenses.value = (data.schedule_data?.extraExpenses || []).map((item) => ({
      uid: item.uid || `${item.name}-${item.expense_date}`,
      ...item,
    }));

    Object.assign(statistics, {
      course_statistics: data.statistics?.course_statistics || [],
      course_total: data.statistics?.course_total || 0,
      extra_expenses: data.statistics?.extra_expenses || [],
      extra_total: data.statistics?.extra_total || 0,
      total_cost: data.statistics?.total_cost || 0,
    });
  } catch (error) {
    message.error(`加载快照失败：${error.message}`);
    router.push({ name: 'snapshot-list' });
  }
}

function openPreview() {
  if (!snapshotInfo.value) return;
  previewVisible.value = true;
}

async function exportSnapshot() {
  if (!snapshotInfo.value) return;
  const target = invoicePreviewRef.value;
  if (!target) {
    message.error('预览内容尚未渲染，请稍候再试');
    return;
  }
  exporting.value = true;
  try {
    await nextTick();
    const scale = Math.min(Math.max(window.devicePixelRatio || 2, 2), 3);
    const canvas = await html2canvas(target, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let renderWidth = pageWidth;
    let renderHeight = (canvas.height * renderWidth) / canvas.width;

    if (renderHeight > pageHeight) {
      const ratio = pageHeight / renderHeight;
      renderWidth *= ratio;
      renderHeight = pageHeight;
    }

    const offsetX = (pageWidth - renderWidth) / 2;
    const offsetY = (pageHeight - renderHeight) / 2;

    pdf.addImage(imgData, 'PNG', offsetX, offsetY, renderWidth, renderHeight, undefined, 'FAST');

    const filename = `${snapshotInfo.value.student_name || 'snapshot'}_${snapshotInfo.value.year_month}_费用清单.pdf`;
    pdf.save(filename);
    message.success('PDF 导出成功');
  } catch (error) {
    console.error(error);
    message.error(`导出失败：${error?.message || '未知错误'}`);
  } finally {
    exporting.value = false;
  }
}

function goBack() {
  router.push({ name: 'snapshot-list' });
}

onMounted(() => {
  fetchSnapshot();
});
</script>

<style scoped>
.snapshot-detail-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
  color: #e2e8f0;
}

.glass-card {
  background: linear-gradient(150deg, rgba(15, 23, 42, 0.82), rgba(17, 24, 39, 0.88));
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 28px 60px rgba(8, 18, 46, 0.58);
  color: #e2e8f0;
}

.page-hero {
  padding: 32px 36px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  overflow: hidden;
}

.page-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(82, 196, 26, 0.22), transparent 55%);
  pointer-events: none;
}

.hero-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
  position: relative;
  z-index: 1;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 560px;
}

.hero-kicker {
  font-size: 13px;
  letter-spacing: 0.18em;
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
  line-height: 1.6;
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
  align-self: flex-end;
}

.hero-metrics {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 18px;
}

.metric-card {
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric-card.highlight {
  border-color: rgba(251, 191, 36, 0.32);
  background: linear-gradient(160deg, rgba(245, 158, 11, 0.22), rgba(251, 191, 36, 0.18));
}

.metric-label {
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.7);
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #fef9c3;
}

.content-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.summary-card :deep(.ant-card-body) {
  padding: 24px;
}

.summary-card :deep(.ant-descriptions) {
  background: transparent !important;
}

.summary-card :deep(.ant-descriptions-bordered .ant-descriptions-item-label),
.summary-card :deep(.ant-descriptions-bordered .ant-descriptions-item-content) {
  background: rgba(15, 23, 42, 0.85);
  border-color: rgba(148, 163, 184, 0.18);
  color: #e2e8f0;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr);
  gap: 24px;
}

.calendar-card :deep(.ant-card-head) {
  background: transparent;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  color: #f8fafc;
}

.calendar-card :deep(.ant-card-body) {
  padding: 24px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
}

.card-icon {
  font-size: 20px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
}

.calendar-header {
  font-weight: 600;
  text-align: center;
  color: rgba(226, 232, 240, 0.72);
  letter-spacing: 0.05em;
}

.calendar-cell {
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.82), rgba(30, 41, 59, 0.86));
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  padding: 14px;
  min-height: 148px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.45);
}

.calendar-cell.is-today {
  border-color: rgba(129, 140, 248, 0.6);
  box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.25);
}

.calendar-cell.is-other-month {
  opacity: 0.45;
}

.cell-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cell-date {
  font-weight: 700;
  color: #f8fafc;
}

.cell-date.weekend {
  color: #fca5a5;
}

.cell-classes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.class-tag {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.22);
  border: 1px solid rgba(59, 130, 246, 0.32);
  color: #e0f2fe;
}

.class-tag-text {
  display: flex;
  flex-direction: column;
  font-size: 12px;
}

.class-tag-text strong {
  font-size: 13px;
}

.cell-empty {
  text-align: center;
  color: rgba(148, 163, 184, 0.6);
  margin-top: 16px;
}

.side-panels {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-card :deep(.ant-card-head) {
  background: transparent;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  color: #f8fafc;
}

.stats-card :deep(.ant-card-body) {
  padding: 20px 24px;
}

.stats-card :deep(.ant-table) {
  background: transparent;
  color: #e2e8f0;
}

.stats-card :deep(.ant-table-thead > tr > th) {
  background: rgba(15, 23, 42, 0.92) !important;
  color: rgba(226, 232, 240, 0.82);
  border-color: rgba(148, 163, 184, 0.18);
}

.stats-card :deep(.ant-table-tbody > tr > td) {
  background: rgba(15, 23, 42, 0.65);
  border-color: rgba(148, 163, 184, 0.12);
  color: #e2e8f0;
}

.invoice-preview {
  padding: 16px;
  background: #f3f4f6;
  border-radius: 12px;
  max-height: 70vh;
  overflow: auto;
}

.invoice-sheet {
  width: 794px;
  min-height: 1123px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 12px;
  padding: 48px 56px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  color: #111827;
  font-family: 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  position: relative;
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.invoice-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.invoice-header p {
  margin: 4px 0 0;
  color: #6b7280;
}

.invoice-meta {
  font-size: 12px;
  color: #4b5563;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.invoice-meta span {
  display: inline-block;
  min-width: 90px;
  font-weight: 600;
  color: #111827;
}

.invoice-section {
  margin-top: 24px;
}

.invoice-section h3 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.invoice-summary {
  margin-top: 24px;
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.summary-row.grand {
  font-weight: 700;
  font-size: 16px;
  color: #1f2937;
}

.invoice-actions {
  margin-top: 24px;
  text-align: right;
}

@media (max-width: 1200px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .side-panels {
    flex-direction: row;
  }
}

@media (max-width: 960px) {
  .page-hero {
    padding: 28px 24px;
  }

  .hero-main {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-actions {
    align-self: flex-start;
  }

  .side-panels {
    flex-direction: column;
  }

  .calendar-grid {
    gap: 10px;
  }

  .calendar-cell {
    min-height: 120px;
  }
}

@media (max-width: 576px) {
  .page-hero {
    padding: 24px 18px;
  }

  .summary-card :deep(.ant-card-body),
  .calendar-card :deep(.ant-card-body),
  .stats-card :deep(.ant-card-body) {
    padding: 20px;
  }

  .layout {
    gap: 20px;
  }
}
</style>
