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
              <div class="invoice-title">ELITE EDU</div>
              <div class="invoice-subtitle">Tuition</div>
            </div>
          </div>

          <div class="invoice-meta-header">
            <div>
              <h1>School Fee Invoice / 课程缴费单</h1>
              <p>账期：{{ monthSummary || '—' }} · 学生：{{ studentNames.join('、') || '—' }}</p>
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

                <div class="extra-section" ref="expenseSection">
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

                <section class="invoice-block schedule-section-block" :ref="el => calendarSections[snapshot.id] = el">
                  <header class="block-header">
                    <h3>课程日历</h3>
                  </header>
                  <div class="calendar-grid">
                    <div class="calendar-header" v-for="dayLabel in ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']" :key="dayLabel">
                      {{ dayLabel }}
                    </div>
                    <template v-for="(week, wIndex) in buildCalendarWeeks(snapshot)" :key="`week-${wIndex}`">
                      <div
                        v-for="day in week"
                        :key="`${day.date}-${day.display}`"
                        class="calendar-cell"
                        :class="{ 'is-other-month': !day.inMonth }"
                      >
                        <div class="cell-header">
                          <span class="cell-date">{{ day.display }}</span>
                          <span class="cell-weekday">{{ day.weekday }}</span>
                        </div>
                        <div v-if="day.lessons && day.lessons.length" class="cell-lessons">
                          <div 
                            v-for="lesson in day.lessons" 
                            :key="lesson.uid || `${lesson.course_name}-${lesson.course_time}`" 
                            class="lesson-pill"
                            :class="`course-color-${getCourseColor(lesson.course_css_class)}`"
                          >
                            <strong>{{ lesson.course_name || '课程' }}</strong>
                            <span>{{ lesson.course_time || '时间待定' }}</span>
                          </div>
                        </div>
                        <div v-else class="cell-empty">无课程</div>
                      </div>
                    </template>
                  </div>
                </section>

                <section class="invoice-block schedule-table-block" :ref="el => tableSections[snapshot.id] = el">
                  <header class="block-header">
                    <h3>课程表（表格）</h3>
                  </header>
                  <table class="schedule-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Timeslot</th>
                        <th>Content</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in buildLessonRows(snapshot)" :key="`${row.date}-${row.time}-${row.content}`">
                        <td>{{ row.date }}</td>
                        <td>{{ row.day }}</td>
                        <td>{{ row.time }}</td>
                        <td>{{ row.content }}</td>
                      </tr>
                      <tr v-if="!buildLessonRows(snapshot).length">
                        <td colspan="4" class="empty-cell">本月暂无课程记录</td>
                      </tr>
                    </tbody>
                  </table>
                </section>
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
import dayjs from 'dayjs';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import MergedSnapshotHeader from '../../components/snapshot/MergedSnapshotHeader.vue';
import MergedMonthSection from '../../components/snapshot/MergedMonthSection.vue';
import TemporaryAdjustmentsPanel from '../../components/snapshot/TemporaryAdjustmentsPanel.vue';
import MergedTotalsPanel from '../../components/snapshot/MergedTotalsPanel.vue';
import { useSnapshotMerge } from '../../composables/useSnapshotMerge';

const route = useRoute();
const router = useRouter();
const previewVisible = ref(false);
const invoicePreviewRef = ref(null);
const logoUrl = new URL('../../assets/elite-logo.png', import.meta.url).href;
const calendarSections = ref({});
const tableSections = ref({});

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

  exporting.value = true;
  try {
    await nextTick();

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const scale = 2.5;

    // 优化的html2canvas配置
    const canvasConfig = {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1400, // 增加窗口宽度
      width: 1000, // 增加渲染宽度
    };

    // 1. 渲染费用明细（不包含日历和表格）
    const mainContent = invoicePreviewRef.value.cloneNode(true);

    // 移除日历和表格区块
    const calendars = mainContent.querySelectorAll('.schedule-section-block');
    const tables = mainContent.querySelectorAll('.schedule-table-block');
    calendars.forEach(el => el.remove());
    tables.forEach(el => el.remove());

    // 临时添加到 DOM，增加宽度
    mainContent.style.position = 'absolute';
    mainContent.style.left = '-9999px';
    mainContent.style.width = '1000px'; // 增加宽度
    document.body.appendChild(mainContent);

    const mainCanvas = await html2canvas(mainContent, canvasConfig);

    document.body.removeChild(mainContent);

    // 添加费用明细页面
    const mainImgData = mainCanvas.toDataURL('image/png');
    const mainImgWidth = pageWidth;
    const mainImgHeight = (mainCanvas.height * pageWidth) / mainCanvas.width;

    let heightLeft = mainImgHeight;
    let position = 0;

    pdf.addImage(mainImgData, 'PNG', 0, position, mainImgWidth, mainImgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - mainImgHeight;
      pdf.addPage();
      pdf.addImage(mainImgData, 'PNG', 0, position, mainImgWidth, mainImgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    // 2. 渲染每个快照的课程日历和表格
    for (const snapshot of snapshots.value) {
      const calendarEl = calendarSections.value[snapshot.id];
      const tableEl = tableSections.value[snapshot.id];

      // 渲染日历
      if (calendarEl) {
        pdf.addPage();

        // 克隆并设置更大宽度
        const calClone = calendarEl.cloneNode(true);
        calClone.style.position = 'absolute';
        calClone.style.left = '-9999px';
        calClone.style.width = '1000px';
        document.body.appendChild(calClone);

        const calendarCanvas = await html2canvas(calClone, canvasConfig);

        document.body.removeChild(calClone);

        const calImgData = calendarCanvas.toDataURL('image/png');
        const calImgWidth = pageWidth;
        const calImgHeight = (calendarCanvas.height * pageWidth) / calendarCanvas.width;

        if (calImgHeight <= pageHeight) {
          pdf.addImage(calImgData, 'PNG', 0, 0, calImgWidth, calImgHeight, undefined, 'FAST');
        } else {
          // 如果日历超过一页，自动分页
          let calHeightLeft = calImgHeight;
          let calPosition = 0;
          pdf.addImage(calImgData, 'PNG', 0, calPosition, calImgWidth, calImgHeight, undefined, 'FAST');
          calHeightLeft -= pageHeight;

          while (calHeightLeft > 0) {
            calPosition = calHeightLeft - calImgHeight;
            pdf.addPage();
            pdf.addImage(calImgData, 'PNG', 0, calPosition, calImgWidth, calImgHeight, undefined, 'FAST');
            calHeightLeft -= pageHeight;
          }
        }
      }

      // 渲染表格
      if (tableEl) {
        pdf.addPage();

        // 克隆并设置更大宽度
        const tblClone = tableEl.cloneNode(true);
        tblClone.style.position = 'absolute';
        tblClone.style.left = '-9999px';
        tblClone.style.width = '1000px';
        document.body.appendChild(tblClone);

        const tableCanvas = await html2canvas(tblClone, canvasConfig);

        document.body.removeChild(tblClone);

        const tblImgData = tableCanvas.toDataURL('image/png');
        const tblImgWidth = pageWidth;
        const tblImgHeight = (tableCanvas.height * pageWidth) / tableCanvas.width;

        if (tblImgHeight <= pageHeight) {
          pdf.addImage(tblImgData, 'PNG', 0, 0, tblImgWidth, tblImgHeight, undefined, 'FAST');
        } else {
          // 如果表格超过一页，自动分页
          let tblHeightLeft = tblImgHeight;
          let tblPosition = 0;
          pdf.addImage(tblImgData, 'PNG', 0, tblPosition, tblImgWidth, tblImgHeight, undefined, 'FAST');
          tblHeightLeft -= pageHeight;

          while (tblHeightLeft > 0) {
            tblPosition = tblHeightLeft - tblImgHeight;
            pdf.addPage();
            pdf.addImage(tblImgData, 'PNG', 0, tblPosition, tblImgWidth, tblImgHeight, undefined, 'FAST');
            tblHeightLeft -= pageHeight;
          }
        }
      }
    }

    const months = monthSummary.value || '账单';
    const filename = `合并账单_${months.replace(/、/g, '_')}.pdf`;
    pdf.save(filename);
    message.success('PDF 导出成功');
  } catch (error) {
    console.error(error);
    message.error(`导出失败：${error?.message || '未知错误'}`);
  } finally {
    exporting.value = false;
  }
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

function buildCalendarWeeks(snapshot) {
  if (!snapshot?.year_month) return [];
  const base = dayjs(`${snapshot.year_month}-01`);
  if (!base.isValid()) return [];

  const firstDay = base.startOf('month');
  const lastDay = base.endOf('month');
  const start = firstDay.startOf('week');
  const end = lastDay.endOf('week');

  const lessonsMap = snapshot?.schedule_data?.lessons || {};
  const weeks = [];
  let cursor = start;
  let currentWeek = [];

  while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
    const dateKey = cursor.format('YYYY-MM-DD');
    const lessons = lessonsMap[dateKey] || [];
    currentWeek.push({
      date: dateKey,
      inMonth: cursor.isSame(base, 'month'),
      display: cursor.format('D'),
      weekday: cursor.format('dddd'),
      lessons,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    cursor = cursor.add(1, 'day');
  }

  return weeks;
}

function buildLessonRows(snapshot) {
  const lessonsMap = snapshot?.schedule_data?.lessons || {};
  const rows = [];
  Object.entries(lessonsMap).forEach(([dateStr, items]) => {
    if (!Array.isArray(items)) return;
    items.forEach((lesson) => {
      rows.push({
        date: dayjs(dateStr).isValid() ? dayjs(dateStr).format('YYYYMMDD') : dateStr,
        day: dayjs(dateStr).isValid() ? dayjs(dateStr).format('dddd') : '—',
        time: lesson?.course_time || '—',
        content: lesson?.course_name || '未命名课程',
      });
    });
  });

  rows.sort((a, b) => {
    if (a.date === b.date) return (a.time || '').localeCompare(b.time || '');
    return a.date.localeCompare(b.date);
  });
  return rows;
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
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px 28px;
  color: #1E293B;
  margin-bottom: 28px;
}

.invoice-logo {
  height: 50px;
  filter: none;
}

.invoice-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1E293B;
}

.invoice-subtitle {
  font-size: 14px;
  color: #64748B;
  margin-top: 4px;
}


.invoice-meta-header {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
  text-align: center;
}

.invoice-meta-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1E293B;
}

.invoice-meta-header p {
  margin: 0;
  color: #64748B;
  font-size: 14px;
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

.schedule-section-block {
  margin-top: 32px;
  page-break-before: always;
  break-before: page;
  padding-top: 40px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
}

.calendar-header {
  background: #f1f5f9;
  padding: 10px 12px;
  font-weight: 600;
  text-align: center;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.calendar-header:nth-child(7n) {
  border-right: none;
}

.calendar-cell {
  min-height: 110px;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #fff;
}

.calendar-cell:nth-child(7n) {
  border-right: none;
}

.calendar-cell.is-other-month {
  background: #f8fafc;
  color: #94a3b8;
}

.cell-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 6px;
}

.cell-date {
  font-weight: 700;
}

.cell-weekday {
  font-size: 11px;
  color: #94a3b8;
}

.cell-lessons {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lesson-pill {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 10px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
}

.lesson-pill strong {
  font-size: 13px;
}

.lesson-pill.course-color-blue {
  background: #dbeafe;
  border-color: #3b82f6;
  color: #1e40af;
}

.lesson-pill.course-color-green {
  background: #d1fae5;
  border-color: #10b981;
  color: #065f46;
}

.lesson-pill.course-color-orange {
  background: #fed7aa;
  border-color: #f97316;
  color: #9a3412;
}

.lesson-pill.course-color-pink {
  background: #fce7f3;
  border-color: #ec4899;
  color: #9f1239;
}

.lesson-pill.course-color-purple {
  background: #e9d5ff;
  border-color: #a855f7;
  color: #6b21a8;
}

.cell-empty {
  color: #cbd5e1;
  font-size: 12px;
}

.schedule-table-block {
  margin-top: 32px;
  page-break-before: always;
  break-before: page;
  padding-top: 40px;
}

@media print {
  .schedule-section-block,
  .schedule-table-block {
    page-break-before: always;
    break-before: page;
  }
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
}

.schedule-table th,
.schedule-table td {
  border-bottom: 1px solid #e2e8f0;
  padding: 10px 12px;
  text-align: left;
}

.schedule-table th {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  font-weight: 600;
  color: #334155;
}

.schedule-table tbody tr {
  transition: all 0.2s ease;
}

.schedule-table tbody tr:hover {
  background: #f8fafc;
}

.schedule-table tbody tr:last-child td {
  border-bottom: none;
}

.schedule-table .empty-cell {
  text-align: center;
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

