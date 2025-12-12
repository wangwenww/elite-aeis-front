<template>
  <div class="snapshot-detail-page">
    <template v-if="snapshotInfo">
      <section class="page-hero surface-card">
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
            <span class="metric-value metric-multiline">{{ formatTotals(statistics.course_totals) }}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">额外费用</span>
            <span class="metric-value metric-multiline">{{ formatTotals(statistics.extra_totals) }}</span>
          </div>
          <div class="metric-card highlight">
            <span class="metric-label">应付总额</span>
            <span class="metric-value metric-multiline">{{ formatTotals(statistics.grand_totals) }}</span>
          </div>
        </div>
      </section>

      <div class="content-grid">
        <a-card class="surface-card summary-card" :bordered="false">
          <a-descriptions :column="3" bordered size="small">
            <a-descriptions-item label="学生">{{ snapshotInfo.student_name || '未命名学生' }}</a-descriptions-item>
            <a-descriptions-item label="月份">{{ snapshotInfo.year_month }}</a-descriptions-item>
            <a-descriptions-item label="保存时间">{{ formatDate(snapshotInfo.created_at) }}</a-descriptions-item>
            <a-descriptions-item label="课程费用">{{ formatTotals(statistics.course_totals) }}</a-descriptions-item>
            <a-descriptions-item label="额外费用">{{ formatTotals(statistics.extra_totals) }}</a-descriptions-item>
            <a-descriptions-item label="总费用">{{ formatTotals(statistics.grand_totals) }}</a-descriptions-item>
          </a-descriptions>
        </a-card>

        <div class="layout">
          <a-card class="surface-card calendar-card" :bordered="false">
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
            <a-card class="surface-card stats-card" :bordered="false">
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
                <template #bodyCell="{ column, text, record }">
                  <template v-if="column.key === 'price_per_class' || column.key === 'total'">
                    {{ formatAmount(text, record.currency || 'CNY') }}
                  </template>
                  <template v-else-if="column.key === 'course_time'">
                    {{ record.course_time || '—' }}
                  </template>
                  <template v-else>
                    {{ text }}
                  </template>
                </template>
              </a-table>
            </a-card>

            <a-card class="surface-card stats-card" :bordered="false">
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
                <template #bodyCell="{ column, text, record }">
                  <template v-if="column.key === 'amount'">
                    {{ formatAmount(text, record.currency || 'CNY') }}
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
          <div class="invoice-green-header">
            <div class="invoice-header-left">
              <img :src="logoUrl" alt="Elite Edu Logo" class="invoice-logo" />
            </div>
            <div class="invoice-header-right">
              <div class="invoice-title">School Fee Invoice</div>
              <div class="invoice-subtitle">ELITE EDUCATION CENTER</div>
            </div>
          </div>
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
              <template #bodyCell="{ column, text, record }">
                <template v-if="column.key === 'price_per_class' || column.key === 'total'">
                  {{ formatAmount(text, record.currency || 'CNY') }}
              </template>
              <template v-else-if="column.key === 'course_time'">
                {{ record.course_time || '—' }}
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
              <template #bodyCell="{ column, text, record }">
                <template v-if="column.key === 'amount'">
                  {{ formatAmount(text, record.currency || 'CNY') }}
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
              <span class="summary-amount">{{ formatTotals(statistics.course_totals) }}</span>
            </div>
            <div class="summary-row">
              <span>Additional Total / 额外费用</span>
              <span class="summary-amount">{{ formatTotals(statistics.extra_totals) }}</span>
            </div>
            <div class="summary-row grand">
              <span>Grand Total / 应付总额</span>
              <span class="summary-amount">{{ formatTotals(statistics.grand_totals) }}</span>
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
import { studentApi } from '../api/student';
import { courseApi } from '../api/course';
import { snapshotApi } from '../api/snapshot';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const route = useRoute();
const router = useRouter();
const snapshotId = route.params.id;

const logoUrl = new URL('../assets/elite-logo.png', import.meta.url).href;

const snapshotInfo = ref(null);
const lessonsMap = reactive({});
const extraExpenses = ref([]);
const statistics = reactive({
  course_statistics: [],
  course_totals: [],
  extra_expenses: [],
  extra_totals: [],
  grand_totals: [],
  course_total: 0,
  extra_total: 0,
  total_cost: 0,
});

const previewVisible = ref(false);
const exporting = ref(false);
const invoicePreviewRef = ref(null);

const weekDays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

const courseColumns = [
  { title: '课程名称', dataIndex: 'course_name', key: 'course_name' },
  { title: '上课时间', dataIndex: 'course_time', key: 'course_time' },
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
  { title: 'Class Time', dataIndex: 'course_time', key: 'course_time' },
  { title: 'Unit Price', dataIndex: 'price_per_class', key: 'price_per_class' },
  { title: 'Quantity', dataIndex: 'count', key: 'count' },
  { title: 'Total', dataIndex: 'total', key: 'total' },
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

function getCurrencySymbol(currency = 'CNY') {
  const map = {
    CNY: '¥',
    SGD: 'S$',
    USD: '$',
  };
  return map[currency] || `${currency} `;
}

function formatAmount(amount, currency = 'CNY') {
  const symbol = getCurrencySymbol(currency);
  const value = Number(amount) || 0;
  return `${symbol}${value.toFixed(2)}`;
}

function formatTotals(totals = []) {
  if (!Array.isArray(totals) || !totals.length) {
    return formatAmount(0, 'CNY');
  }
  return totals
    .map((item) => formatAmount(item?.amount ?? 0, item?.currency ?? 'CNY'))
    .join('\n');
}

function formatCurrency(value, currency = 'CNY') {
  if (!value) return formatAmount(0, currency);
  return formatAmount(value, currency);
}

function formatDate(value, format = 'YYYY-MM-DD HH:mm') {
  if (!value) return '--';
  return dayjs(value).format(format);
}

function buildCourseTimeLookup() {
  const byId = new Map();
  const byName = new Map();
  Object.values(lessonsMap).forEach((items) => {
    if (!Array.isArray(items)) return;
    items.forEach((lesson) => {
      if (!lesson || !lesson.course_time) return;
      if (lesson.course_id != null && !byId.has(lesson.course_id)) {
        byId.set(lesson.course_id, lesson.course_time);
      }
      const nameKey = lesson.course_name;
      if (nameKey && !byName.has(nameKey)) {
        byName.set(nameKey, lesson.course_time);
      }
    });
  });
  return { byId, byName };
}

function ensureCourseTimes(courseStats) {
  if (!Array.isArray(courseStats) || !courseStats.length) return;
  const { byId, byName } = buildCourseTimeLookup();
  courseStats.forEach((item) => {
    if (item.course_time) return;
    if (item.course_id != null && byId.has(item.course_id)) {
      item.course_time = byId.get(item.course_id);
    } else if (item.course_name && byName.has(item.course_name)) {
      item.course_time = byName.get(item.course_name);
    }
  });
}

async function fetchSnapshot() {
  try {
    const { data } = await snapshotApi.getSnapshotItem(snapshotId);
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

    const statsPayload = data.statistics || {};
    statistics.course_statistics = (statsPayload.course_statistics || []).map((item) => ({
      ...item,
      currency: item.currency || 'CNY',
    }));
    ensureCourseTimes(statistics.course_statistics);
    statistics.course_totals = statsPayload.course_totals || [];
    statistics.extra_expenses = (statsPayload.extra_expenses || []).map((item) => ({
      ...item,
      currency: item.currency || 'CNY',
    }));
    statistics.extra_totals = statsPayload.extra_totals || [];
    statistics.grand_totals = statsPayload.grand_totals || [];
    statistics.course_total = statsPayload.course_total || 0;
    statistics.extra_total = statsPayload.extra_total || 0;
    statistics.total_cost = statsPayload.total_cost || 0;
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
/* CSS变量定义 */
:root {
  --primary-gradient: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.snapshot-detail-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
  color: #1E293B;
  background: linear-gradient(to bottom, #F8FAFC 0%, #F1F5F9 100%);
  min-height: 100vh;
  padding: 24px;
}

/* 页面英雄区域 */
.page-hero {
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.page-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2563eb 0%, #6366F1 50%, #8B5CF6 100%);
}

.page-hero:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.hero-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 600px;
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

.hero-kicker {
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748B;
  font-weight: 600;
}

.hero-text h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #1E293B;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #1E293B 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-text p {
  margin: 0;
  font-size: 16px;
  color: #64748B;
  line-height: 1.6;
}

.hero-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-tags :deep(.ant-tag) {
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 13px;
  border: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.hero-tags :deep(.ant-tag):hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-sm);
}

.hero-actions {
  align-self: flex-end;
}

/* 指标卡片 */
.hero-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.metric-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #2563eb, #6366F1);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.metric-card:hover::before {
  transform: scaleX(1);
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: rgba(37, 99, 235, 0.3);
}

.metric-card.highlight {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: rgba(251, 146, 60, 0.5);
}

.metric-label {
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #94A3B8;
  font-weight: 600;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #1E293B;
  font-variant-numeric: tabular-nums;
}

.metric-value.metric-multiline {
  white-space: pre-line;
  line-height: 1.4;
}

/* 内容区域 */
.content-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.summary-card,
.calendar-card,
.stats-card {
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.summary-card:hover,
.calendar-card:hover,
.stats-card:hover {
  box-shadow: var(--shadow-md);
}

.summary-card :deep(.ant-card-body) {
  padding: 24px;
}

.summary-card :deep(.ant-descriptions-bordered .ant-descriptions-item-label),
.summary-card :deep(.ant-descriptions-bordered .ant-descriptions-item-content) {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #1E293B;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
  gap: 24px;
}

.calendar-card :deep(.ant-card-head),
.stats-card :deep(.ant-card-head) {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-bottom: 2px solid #e2e8f0;
  color: #1E293B;
  font-size: 17px;
  padding: 20px 24px;
}

.calendar-card :deep(.ant-card-body),
.stats-card :deep(.ant-card-body) {
  padding: 24px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 600;
}

.card-icon {
  font-size: 22px;
}

/* 日历样式 */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
}

.calendar-header {
  font-weight: 600;
  text-align: center;
  color: #64748b;
  letter-spacing: 0.02em;
  padding: 8px;
}

.calendar-cell {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.2s ease;
}

.calendar-cell:hover {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.calendar-cell.is-today {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
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
  font-weight: 600;
  color: #1E293B;
}

.cell-date.weekend {
  color: #e11d48;
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
  border-radius: 8px;
  transition: all 0.2s ease;
}

.class-tag:hover {
  transform: scale(1.02);
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
  color: #94a3b8;
  margin-top: 16px;
  font-size: 13px;
}

/* 侧边栏 */
.side-panels {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-card :deep(.ant-table) {
  background: transparent;
  border-radius: 12px;
  overflow: hidden;
}

.stats-card :deep(.ant-table-thead > tr > th) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-color: #e2e8f0;
  color: #334155;
  font-weight: 600;
  padding: 14px 16px;
}

.stats-card :deep(.ant-table-tbody > tr) {
  transition: all 0.2s ease;
}

.stats-card :deep(.ant-table-tbody > tr:hover) {
  background: #f8fafc !important;
}

.stats-card :deep(.ant-table-tbody > tr > td) {
  background: #ffffff;
  border-color: #f1f5f9;
  padding: 12px 16px;
}

/* 发票预览 */
.invoice-preview {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 12px;
  max-height: 70vh;
  overflow: auto;
}

.invoice-sheet {
  width: 794px;
  min-height: 1123px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  padding: 0 56px 48px;
  box-shadow: var(--shadow-lg);
  color: #111827;
  font-family: 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  position: relative;
}

.invoice-green-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  padding: 28px 36px;
  border-radius: 16px 16px 0 0;
  color: #ffffff;
  margin: 0 -56px 28px;
}

.invoice-header-left {
  flex: 1;
  text-align: left;
}

.invoice-header-right {
  flex: 1;
  text-align: right;
}

.invoice-logo {
  height: 52px;
  width: auto;
}

.invoice-title {
  font-size: 24px;
  font-weight: 700;
}

.invoice-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}

.invoice-actions {
  margin-top: 28px;
  text-align: right;
}

.invoice-meta {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #475569;
  margin-top: 12px;
}

.invoice-section {
  margin-top: 28px;
  padding-top: 28px;
  border-top: 1px solid #e2e8f0;
}

.invoice-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 16px;
}

.invoice-summary {
  margin-top: 28px;
  border-top: 2px solid #e2e8f0;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.summary-amount {
  text-align: right;
  white-space: pre-line;
  line-height: 1.4;
  font-size: 16px;
  font-weight: 700;
  color: #1E293B;
}

.summary-row.grand {
  font-weight: 700;
  font-size: 16px;
  color: #1E293B;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.summary-row.grand .summary-amount {
  font-size: 18px;
  color: #2563eb;
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
@media (max-width: 1200px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .side-panels {
    flex-direction: row;
  }
}

@media (max-width: 960px) {
  .snapshot-detail-page {
    padding: 16px;
  }

  .page-hero {
    padding: 24px;
  }

  .hero-main {
    flex-direction: column;
  }

  .side-panels {
    flex-direction: column;
  }
}

@media (max-width: 576px) {
  .page-hero {
    padding: 20px;
  }

  .hero-text h1 {
    font-size: 24px;
  }

  .summary-card :deep(.ant-card-body),
  .calendar-card :deep(.ant-card-body),
  .stats-card :deep(.ant-card-body) {
    padding: 18px;
  }

  .layout {
    gap: 18px;
  }
}
</style>
