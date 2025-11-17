<template>
  <div class="schedule-page">
    <section class="page-hero surface-card">
      <div class="hero-text">
        <h1>月度课时费管理系统</h1>
        <p>为 Elite Edu 学员提供精准的课表制定与费用结算体验</p>
        <div class="hero-meta">
          <Tag severity="info" rounded>{{ formattedMonth }}</Tag>
          <Tag v-if="currentStudentName" severity="success" rounded>学生：{{ currentStudentName }}</Tag>
          <Tag v-else severity="warning" rounded>请选择学生</Tag>
        </div>
      </div>

      <div class="hero-metrics">
        <div class="metric-item">
          <span class="metric-label">课程节次</span>
          <span class="metric-value">{{ totalLessons }}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">额外费用</span>
          <span class="metric-value">{{ extraExpenses.length }}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">状态</span>
          <span class="metric-badge" :class="{ dirty: isDirty, clean: !isDirty }">
            {{ isDirty ? '待保存' : '已同步' }}
          </span>
        </div>
      </div>
    </section>

    <ScheduleToolbar
      :student-options="studentOptions"
      :current-student-id="currentStudentId"
      :selected-month="selectedMonth"
      :save-disabled="saveDisabled"
      @change-student="handleStudentChange"
      @change-month="handleMonthChange"
      @open-quick-add="openQuickAddDialog"
      @save-snapshot="saveSnapshot"
    />

    <div class="content-grid">
      <CourseLibrary
        :courses="courses"
        :loading="coursesLoading"
        :format-amount="formatAmount"
        @drag-start="onCourseDragStart"
        @manage-courses="courseModalOpen = true"
      />

      <main class="main-panel">
        <ScheduleCalendar
          :week-days="weekDays"
          :flat-calendar="flatCalendar"
          :calendar-matrix="calendarMatrix"
          :current-student-name="currentStudentName"
          :formatted-month="formattedMonth"
          :selected-month="selectedMonth"
          :get-course-color="getCourseColor"
          @open-add="openAddDialog"
          @delete-lesson="deleteLesson"
          @drag-over="onCellDragOver"
          @drag-leave="onCellDragLeave"
          @drop="onCellDrop"
        />

        <StatisticsPanel
          :statistics="statistics"
          :columns="courseStatsColumns"
          :format-amount="formatAmount"
          :format-totals="formatTotals"
        />

        <ExtraExpensePanel
          :extra-expenses="extraExpenses"
          :columns="extraExpenseColumns"
          :format-amount="formatAmount"
          :add-disabled="!currentStudentId"
          @add-expense="openExpenseDialog()"
          @edit-expense="openExpenseDialog"
          @delete-expense="deleteExpense"
        />
      </main>
    </div>

    <a-modal
      v-model:open="courseModalOpen"
      title="📖 课程管理"
      :width="960"
      :footer="null"
      destroyOnClose
      @cancel="handleCourseModalHide"
    >
      <div class="course-modal-body">
        <div class="course-table-wrapper">
          <a-spin v-if="coursesLoading" size="large" />

          <a-table
            v-else-if="courses.length"
            :columns="courseColumns"
            :data-source="courses"
            :pagination="false"
            rowKey="id"
            class="course-table"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'price'">
                {{ formatAmount(record.price, record.currency) }}
              </template>
              <template v-else-if="column.key === 'color'">
                <a-tag :color="getCourseColor(record.css_class)" class="color-tag">
                  {{ colorLabelMap[record.css_class] || record.css_class }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'actions'">
                <div class="action-group">
                  <a-button type="link" size="small" @click="editCourse(record)">编辑</a-button>
                  <a-popconfirm
                    title="确定删除此课程吗？"
                    ok-text="删除"
                    cancel-text="取消"
                    @confirm="() => deleteCourse(record.id)"
                  >
                    <a-button type="link" size="small" danger>删除</a-button>
                  </a-popconfirm>
                </div>
              </template>
              <template v-else>
                {{ record[column.dataIndex] ?? '—' }}
              </template>
            </template>
          </a-table>

          <div v-else class="empty-state">
            <InboxOutlined />
            <span>暂无课程数据</span>
          </div>
        </div>

        <a-divider orientation="center">{{ editingCourse ? '编辑课程' : '新增课程' }}</a-divider>

        <div class="form-grid">
          <div class="form-field">
            <label>课程名称</label>
            <a-input v-model:value="courseForm.name" placeholder="例如：数学晚课" />
          </div>
          <div class="form-field">
            <label>上课时间</label>
            <a-input v-model:value="courseForm.time" placeholder="例如：20:00-21:30" />
          </div>
          <div class="form-field">
            <label>课时费用</label>
            <a-input-number v-model:value="courseForm.price" :min="0" :step="50" style="width: 100%;" />
          </div>
          <div class="form-field">
            <label>币种</label>
            <a-select v-model:value="courseForm.currency" :options="currencyOptions" />
          </div>
          <div class="form-field">
            <label>课程颜色</label>
            <a-select v-model:value="courseForm.css_class" :options="colorOptions" />
          </div>
          <div class="form-field form-field-full">
            <label>课程描述</label>
            <a-textarea
              v-model:value="courseForm.description"
              :rows="3"
              :maxlength="200"
              show-count
              placeholder="选填，例如：AEIS 数学冲刺课程"
            />
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <a-button @click="handleCourseModalHide">关闭</a-button>
        <a-button type="primary" @click="saveCourse">
          {{ editingCourse ? '保存修改' : '添加课程' }}
        </a-button>
      </div>
    </a-modal>

    <a-modal
      v-model:open="addModalOpen"
      title="➕ 添加课程"
      :footer="null"
      destroyOnClose
      @cancel="handleAddModalHide"
    >
      <div class="form-vertical">
        <div class="form-field">
          <label>上课日期</label>
          <a-input :value="selectedDate" disabled />
        </div>
        <div class="form-field">
          <label>选择课程</label>
          <a-select
            v-model:value="addForm.courseId"
            :options="courseSelectOptions"
            placeholder="请选择课程"
          />
        </div>
      </div>

      <div class="dialog-footer">
        <a-button @click="closeAddDialog">取消</a-button>
        <a-button type="primary" :disabled="!addForm.courseId" @click="addSchedule">添加课程</a-button>
      </div>
    </a-modal>

    <a-modal
      v-model:open="quickAddModalOpen"
      title="⚡ 快捷批量添加"
      :footer="null"
      destroyOnClose
      @cancel="handleQuickAddHide"
    >
      <a-alert type="info" show-icon message="此功能会在当月指定星期的所有日期添加选中的课程" class="mb-3" />
      <div class="form-vertical">
        <div class="form-field">
          <label>选择课程</label>
          <a-select
            v-model:value="quickAddForm.courseId"
            :options="courseSelectOptions"
            placeholder="请选择课程"
          />
        </div>
        <div class="form-field">
          <label>选择星期</label>
          <a-select
            v-model:value="quickAddForm.dayOfWeek"
            :options="weekDayOptions"
            mode="multiple"
            placeholder="请选择每周的上课日"
          />
        </div>
      </div>

      <div class="dialog-footer">
        <a-button @click="closeQuickAddDialog">取消</a-button>
        <a-button
          type="primary"
          :disabled="!quickAddForm.courseId || !quickAddForm.dayOfWeek.length"
          @click="quickAddSchedules"
        >
          批量添加
        </a-button>
      </div>
    </a-modal>

    <a-modal
      v-model:open="expenseModalOpen"
      :title="editingExpense ? '✏️ 编辑额外费用' : '➕ 新增额外费用'"
      :footer="null"
      destroyOnClose
      @cancel="handleExpenseHide"
    >
      <div class="form-vertical">
        <div class="form-field">
          <label>费用名称</label>
          <a-input v-model:value="expenseForm.name" placeholder="例如：教材费" />
        </div>
        <div class="form-field">
          <label>费用日期</label>
          <a-date-picker
            v-model:value="expenseDateModel"
            format="YYYY-MM-DD"
            :allowClear="false"
          />
        </div>
        <div class="form-field">
          <label>金额 (元)</label>
          <a-input-number v-model:value="expenseForm.amount" :min="0" :step="50" style="width: 100%;" />
        </div>
        <div class="form-field">
          <label>币种</label>
          <a-select v-model:value="expenseForm.currency" :options="currencyOptions" />
        </div>
        <div class="form-field form-field-full">
          <label>备注</label>
          <a-textarea v-model:value="expenseForm.notes" :rows="3" />
        </div>
      </div>

      <div class="dialog-footer">
        <a-button @click="closeExpenseDialog">取消</a-button>
        <a-button type="primary" @click="saveExpense">保存费用</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import dayjs from 'dayjs';
import { message } from 'ant-design-vue';
import { InboxOutlined } from '@ant-design/icons-vue';
import http from '../api/http';
import ScheduleToolbar from '../components/schedule/ScheduleToolbar.vue';
import CourseLibrary from '../components/schedule/CourseLibrary.vue';
import ScheduleCalendar from '../components/schedule/ScheduleCalendar.vue';
import StatisticsPanel from '../components/schedule/StatisticsPanel.vue';
import ExtraExpensePanel from '../components/schedule/ExtraExpensePanel.vue';
import { useScheduleEditor, generateUid } from '../composables/useScheduleEditor.js';

const {
  selectedMonth,
  isDirty,
  lessonsMap,
  extraExpenses,
  draggedCourse,
  weekDays,
  flatCalendar,
  calendarMatrix,
  formattedMonth,
  totalLessons,
  statistics,
  markDirty,
  resetState,
  addLessonToDate,
  deleteLesson,
  serializeLessons,
  serializeExtraExpenses,
  collectDatesByWeekday,
} = useScheduleEditor();


const students = ref([]);
const currentStudentId = ref();

const courses = ref([]);
const coursesLoading = ref(false);
const courseModalOpen = ref(false);
const addModalOpen = ref(false);
const quickAddModalOpen = ref(false);
const expenseModalOpen = ref(false);

const editingCourse = ref(null);
const courseForm = reactive({
  name: '',
  time: '',
  price: 0,
  currency: 'CNY',
  css_class: 'blue',
  description: '',
});

const addForm = reactive({
  courseId: null,
});
const selectedDate = ref('');

const quickAddForm = reactive({
  courseId: null,
  dayOfWeek: [],
});

const expenseForm = reactive({
  uid: '',
  name: '',
  expense_date: dayjs().format('YYYY-MM-DD'),
  amount: 0,
  currency: 'CNY',
  notes: '',
});
const editingExpense = ref(null);

const expenseDateModel = computed({
  get() {
    if (!expenseForm.expense_date) return null;
    return dayjs(expenseForm.expense_date, 'YYYY-MM-DD');
  },
  set(value) {
    expenseForm.expense_date = value ? dayjs(value).format('YYYY-MM-DD') : '';
  },
});

const studentOptions = computed(() => students.value.map((s) => ({ label: s.name, value: s.id })));
const currentStudent = computed(() => students.value.find((s) => s.id === currentStudentId.value));
const currentStudentName = computed(() => currentStudent.value?.name || '');

const courseSelectOptions = computed(() =>
  courses.value.map((course) => ({
    label: `${course.name} (${course.time}) - ${formatAmount(course.price, course.currency)}`,
    value: course.id,
  }))
);

const courseMap = computed(() => {
  const map = new Map();
  courses.value.forEach((course) => {
    map.set(course.id, course);
  });
  return map;
});
const saveDisabled = computed(() => !currentStudentId.value || !isDirty.value);

const extraExpenseColumns = [
  { title: '日期', dataIndex: 'expense_date', key: 'expense_date' },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '币种', dataIndex: 'currency', key: 'currency' },
  { title: '备注', dataIndex: 'notes', key: 'notes' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  { title: '操作', key: 'actions' },
];

const courseColumns = [
  { title: '课程名称', dataIndex: 'name', key: 'name' },
  { title: '上课时间', dataIndex: 'time', key: 'time' },
  { title: '费用 (元)', dataIndex: 'price', key: 'price' },
  { title: '颜色', dataIndex: 'css_class', key: 'color' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '操作', key: 'actions', dataIndex: 'actions' },
];

const courseStatsColumns = [
  { title: '课程名称', dataIndex: 'course_name', key: 'course_name' },
  { title: '上课时间', dataIndex: 'time_slots', key: 'time_slots' },
  { title: '币种', dataIndex: 'currency', key: 'currency' },
  { title: '课时数', dataIndex: 'count', key: 'count' },
  { title: '单价', dataIndex: 'price_per_class', key: 'price_per_class' },
  { title: '小计', dataIndex: 'total', key: 'total' },
];

const weekDayOptions = [
  { label: '每周一', value: 1 },
  { label: '每周二', value: 2 },
  { label: '每周三', value: 3 },
  { label: '每周四', value: 4 },
  { label: '每周五', value: 5 },
  { label: '每周六', value: 6 },
  { label: '每周日', value: 0 },
];

const colorOptions = [
  { label: '蓝色', value: 'blue' },
  { label: '绿色', value: 'green' },
  { label: '橙色', value: 'orange' },
  { label: '粉色', value: 'pink' },
  { label: '紫色', value: 'purple' },
];

const colorLabelMap = {
  blue: '蓝色',
  green: '绿色',
  orange: '橙色',
  pink: '粉色',
  purple: '紫色',
};

const currencyOptions = [
  { label: '人民币 (CNY)', value: 'CNY' },
  { label: '新加坡元 (SGD)', value: 'SGD' },
];

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

function onCourseDragStart(event, course) {
  draggedCourse.value = course;
  if (event?.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('text/plain', course.id.toString());
  }
}

function onCellDragOver(event, day) {
  if (!day.inCurrentMonth || !currentStudentId.value) return;
  event.dataTransfer.dropEffect = 'copy';
  event.currentTarget.classList.add('drag-over');
}

function onCellDragLeave(event) {
  event.currentTarget.classList.remove('drag-over');
}

function onCellDrop(event, day) {
  event.currentTarget.classList.remove('drag-over');
  if (!day.inCurrentMonth || !draggedCourse.value || !currentStudentId.value) return;
  addLessonToDate(day.date, draggedCourse.value);
  draggedCourse.value = null;
  message.success('课程已添加');
}

function openAddDialog(dateStr) {
  if (!currentStudentId.value) {
    message.warning('请先选择学生');
    return;
  }
  if (!courses.value.length) {
    message.warning('请先添加课程');
    courseModalOpen.value = true;
    return;
  }
  selectedDate.value = dateStr;
  addForm.courseId = null;
  addModalOpen.value = true;
}

function closeAddDialog() {
  addModalOpen.value = false;
  resetAddForm();
}

function handleAddModalHide() {
  resetAddForm();
}

function addSchedule() {
  if (!addForm.courseId) {
    message.warning('请选择课程');
    return;
  }
  const course = courseMap.value.get(addForm.courseId);
  if (!course) {
    message.error('课程不存在，请刷新后重试');
    return;
  }
  addLessonToDate(selectedDate.value, course);
  addModalOpen.value = false;
  resetAddForm();
  message.success('课程添加成功');
}

function resetAddForm() {
  addForm.courseId = null;
  selectedDate.value = '';
}

function openQuickAddDialog() {
  quickAddForm.courseId = null;
  quickAddForm.dayOfWeek = [];
  quickAddModalOpen.value = true;
  if (!courses.value.length) {
    message.info('当前暂未创建课程，请先在课程库中添加。');
  }
}

function closeQuickAddDialog() {
  quickAddModalOpen.value = false;
  resetQuickAddForm();
}

function handleQuickAddHide() {
  resetQuickAddForm();
}

function quickAddSchedules() {
  if (!quickAddForm.courseId) {
    message.warning('请选择课程');
    return;
  }
  const selectedDays = Array.isArray(quickAddForm.dayOfWeek)
    ? quickAddForm.dayOfWeek.filter((value) => value !== undefined && value !== null)
    : [];
  if (!selectedDays.length) {
    message.warning('请选择至少一个星期');
    return;
  }
  const course = courseMap.value.get(quickAddForm.courseId);
  if (!course) {
    message.error('课程不存在');
    return;
  }
  const dates = collectDatesByWeekday(selectedDays);
  if (!dates.length) {
    message.info('当月没有匹配的日期');
    return;
  }
  dates.forEach((dateStr) => addLessonToDate(dateStr, course));
  quickAddModalOpen.value = false;
  resetQuickAddForm();
  message.success(`已在当月 ${dates.length} 个日期添加课程`);
}

function resetQuickAddForm() {
  quickAddForm.courseId = null;
  quickAddForm.dayOfWeek = [];
}

function openExpenseDialog(expense) {
  if (!currentStudentId.value) {
    message.warning('请先选择学生');
    return;
  }
  if (expense) {
    editingExpense.value = expense;
    expenseForm.uid = expense.uid;
    expenseForm.name = expense.name;
    expenseForm.expense_date = expense.expense_date;
    expenseForm.amount = expense.amount;
    expenseForm.currency = expense.currency || 'CNY';
    expenseForm.notes = expense.notes;
  } else {
    editingExpense.value = null;
    expenseForm.uid = generateUid('expense');
    expenseForm.name = '';
    expenseForm.expense_date = dayjs().format('YYYY-MM-DD');
    expenseForm.amount = 0;
    expenseForm.currency = 'CNY';
    expenseForm.notes = '';
  }
  expenseModalOpen.value = true;
}

function saveExpense() {
  if (!expenseForm.name || !expenseForm.expense_date || expenseForm.amount <= 0) {
    message.warning('请填写完整的费用信息');
    return;
  }
  const normalized = {
    uid: expenseForm.uid,
    name: expenseForm.name,
    expense_date: expenseForm.expense_date,
    amount: Number(expenseForm.amount) || 0,
    currency: expenseForm.currency || 'CNY',
    notes: expenseForm.notes,
  };

  if (editingExpense.value) {
    const index = extraExpenses.value.findIndex((item) => item.uid === editingExpense.value.uid);
    if (index !== -1) {
      extraExpenses.value.splice(index, 1, normalized);
    }
  } else {
    extraExpenses.value.push(normalized);
  }

  expenseModalOpen.value = false;
  editingExpense.value = null;
  resetExpenseForm();
  markDirty();
  message.success('费用已保存');
}

function resetExpenseForm() {
  editingExpense.value = null;
  expenseForm.uid = '';
  expenseForm.name = '';
  expenseForm.expense_date = dayjs().format('YYYY-MM-DD');
  expenseForm.amount = 0;
  expenseForm.currency = 'CNY';
  expenseForm.notes = '';
}

function handleExpenseHide() {
  resetExpenseForm();
}

function closeExpenseDialog() {
  expenseModalOpen.value = false;
  resetExpenseForm();
}

function deleteExpense(uid) {
  const index = extraExpenses.value.findIndex((item) => item.uid === uid);
  if (index !== -1) {
    extraExpenses.value.splice(index, 1);
    markDirty();
    message.success('费用已删除');
  }
}

function getCourseColor(cssClass) {
  const map = {
    blue: '#2563eb',
    green: '#22c55e',
    orange: '#f97316',
    pink: '#ec4899',
    purple: '#a855f7',
  };
  return map[cssClass] || '#2563eb';
}

function handleStudentChange(value) {
  currentStudentId.value = value ?? null;
  resetState();
}

function handleMonthChange(value) {
  if (value) {
    selectedMonth.value = value;
  } else {
    selectedMonth.value = dayjs().format('YYYY-MM');
  }
  resetState();
}

async function loadStudents() {
  try {
    const { data } = await http.get('/api/students');
    students.value = data.students || [];
    if (!students.value.length) {
      message.warning('暂无学生数据，请先在后端维护学生');
    }
  } catch (error) {
    message.error(`加载学生列表失败：${error.message}`);
  }
}

async function loadCourses() {
  coursesLoading.value = true;
  try {
    const { data } = await http.get('/api/courses');
    courses.value = Array.isArray(data) ? data : [];
  } catch (error) {
    message.error(`加载课程失败：${error.message}`);
  } finally {
    coursesLoading.value = false;
  }
}

async function saveSnapshot() {
  if (!currentStudentId.value) {
    message.warning('请先选择学生');
    return;
  }
  const ym = dayjs(selectedMonth.value).format('YYYY-MM');
  const payload = {
    student_id: currentStudentId.value,
    year_month: ym,
    schedule_data: {
      lessons: serializeLessons(),
      extraExpenses: serializeExtraExpenses(),
    },
  };

  try {
    await http.post('/api/schedule-snapshots/save', payload);
    isDirty.value = false;
    message.success('课表已保存（已生成新快照）');
  } catch (error) {
    message.error(`保存失败：${error.message}`);
  }
}

function editCourse(course) {
  editingCourse.value = course;
  Object.assign(courseForm, course);
  if (!courseForm.currency) {
    courseForm.currency = 'CNY';
  }
  courseModalOpen.value = true;
}

function cancelEditCourse() {
  editingCourse.value = null;
  Object.assign(courseForm, {
    name: '',
    time: '',
    price: 0,
    currency: 'CNY',
    css_class: 'blue',
    description: '',
  });
}

function handleCourseModalHide() {
  cancelEditCourse();
  courseModalOpen.value = false;
}

async function deleteCourse(courseId) {
  try {
    await http.delete(`/api/courses/${courseId}`);
    message.success('课程删除成功');
    await loadCourses();
  } catch (error) {
    message.error(`删除课程失败：${error.message}`);
  }
}

onMounted(async () => {
  await Promise.all([loadStudents(), loadCourses()]);
  resetState();
});
</script>

<style scoped>
.schedule-page {
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
  max-width: 540px;
}

.hero-text h1 {
  font-size: 30px;
  margin: 0 0 10px;
  font-weight: 700;
  color: #102a43;
}

.hero-text p {
  margin: 0;
  font-size: 16px;
  color: #5f6b7c;
}

.hero-meta {
  margin-top: 18px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-meta :deep(.ant-tag) {
  border-radius: 999px;
  padding: 4px 14px;
  font-size: 13px;
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(140px, 1fr));
  gap: 18px;
}

.metric-item {
  background: #f8fafc;
  border-radius: 12px;
  padding: 18px 20px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric-label {
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
}

.metric-value {
  font-size: 26px;
  font-weight: 700;
  color: #1d3557;
}

.metric-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  background: #edf2f7;
  color: #2d3748;
}

.metric-badge.dirty {
  background: #fdece8;
  color: #c2410c;
}

.metric-badge.clean {
  background: #e7f6ec;
  color: #166534;
}

.toolbar-card :deep(.ant-card-body) {
  padding: 18px 28px;
}

.toolbar-actions {
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.content-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
}

.main-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cell-empty {
  color: #94a3b8;
  text-align: center;
  margin-top: 12px;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .main-panel {
    order: 1;
  }
}

@media (max-width: 768px) {
  .page-hero {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px 22px;
  }

  .hero-metrics {
    width: 100%;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}

.course-modal-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.course-table-wrapper {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.course-table-wrapper .empty-state {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #94a3b8;
}

.course-table-wrapper .empty-state .anticon {
  font-size: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.form-field-full {
  grid-column: 1 / -1;
}

.form-vertical {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-vertical .form-field label {
  font-weight: 600;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer .ant-btn {
  min-width: 120px;
}

.course-table :deep(.ant-table-thead > tr > th) {
  background: #f8fafc;
  font-weight: 600;
}

.course-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
}
</style>
