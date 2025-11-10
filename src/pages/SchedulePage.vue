<template>
  <div class="schedule-page">
    <section class="page-hero glass-panel">
      <div class="hero-text">
        <h1>月度课时费管理系统</h1>
        <p>为 Elite Edu 学员提供精准的课表制定与费用结算体验</p>
        <div class="hero-meta">
          <a-tag color="green" :bordered="false">{{ formattedMonth }}</a-tag>
          <a-tag v-if="currentStudentName" color="blue" :bordered="false">学生：{{ currentStudentName }}</a-tag>
          <a-tag v-else color="gold" :bordered="false">请选择学生</a-tag>
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

    <a-card class="toolbar-card glass-panel" bordered>
      <a-space class="toolbar-actions" size="middle" wrap>
        <a-select
          v-model:value="currentStudentId"
          :options="studentOptions"
          allow-clear
          show-search
          placeholder="请选择学生"
          class="toolbar-select"
          @change="handleStudentChange"
        />

        <a-date-picker
          v-model:value="selectedMonth"
          picker="month"
          format="YYYY年MM月"
          value-format="YYYY-MM"
          class="toolbar-select"
          @change="handleMonthChange"
        />

        <a-tooltip
          placement="bottom"
          title="利用快捷批量添加，为选定课程生成整月排课"
        >
          <a-button type="default" size="large" @click="openQuickAddDialog">
            ⚡ 快捷批量添加
          </a-button>
        </a-tooltip>

        <a-button
          type="primary"
          size="large"
          :disabled="!currentStudentId || !isDirty"
          @click="saveSnapshot"
        >
          💾 保存课表
        </a-button>

        <a-button type="default" size="large" disabled>
          📄 导出PDF
        </a-button>
      </a-space>
    </a-card>

    <div class="content-grid">
      <aside class="course-panel">
        <div class="panel-header">
          <h2>课程库</h2>
          <p>拖拽课程到日历以添加课时</p>
        </div>
        <div class="course-list">
          <a-card
            v-for="course in courses"
            :key="course.id"
            class="course-card"
            draggable="true"
            @dragstart="onCourseDragStart($event, course)"
            bordered
            hoverable
          >
            <div class="course-card-title">{{ course.name }}</div>
            <div class="course-card-meta">
              <span>{{ course.time }}</span>
              <span class="course-price">¥{{ course.price }}</span>
            </div>
          </a-card>

          <a-empty v-if="!courses.length && !coursesLoading" description="暂无课程" />
        </div>
        <a-button type="primary" block size="large" @click="courseModalOpen = true">
          ➕ 管理课程
        </a-button>
      </aside>

      <main class="main-panel">
        <a-card class="calendar-card" bordered>
          <template #title>
            <div class="card-title">
              <div class="card-title-text">
                <span class="card-icon">📅</span>
                <span>课程日历</span>
              </div>
              <div class="card-title-tags">
                <a-tag v-if="currentStudentName" color="success">学生：{{ currentStudentName }}</a-tag>
                <a-tag color="processing">{{ formattedMonth }}</a-tag>
              </div>
            </div>
          </template>

          <div class="calendar-grid">
            <div class="calendar-header" v-for="dayLabel in weekDays" :key="dayLabel">{{ dayLabel }}</div>

            <div
              v-for="day in flatCalendar"
              :key="day.key"
              class="calendar-cell"
              :class="{ 'is-today': day.isToday, 'is-other-month': !day.inCurrentMonth }"
              @dragover.prevent="onCellDragOver($event, day)"
              @dragleave="onCellDragLeave($event)"
              @drop.prevent="onCellDrop($event, day)"
            >
              <div class="cell-header">
                <span class="cell-date" :class="{ weekend: day.isWeekend }">{{ day.display }}</span>
                <a-button
                  v-if="day.inCurrentMonth"
                  type="text"
                  size="small"
                  class="cell-add-btn"
                  @click.stop="openAddDialog(day.date)"
                >
                  + 添加
                </a-button>
              </div>

              <div v-if="day.classes.length" class="cell-classes">
                <a-tag
                  v-for="cls in day.classes"
                  :key="cls.uid"
                  :color="getCourseColor(cls.course_css_class)"
                  class="class-tag"
                  closable
                  @close.prevent="deleteLesson(day.date, cls.uid)"
                >
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

        <a-card class="stats-card" bordered>
          <template #title>
            <div class="card-title">
              <div class="card-title-text">
                <span class="card-icon">💰</span>
                <span>费用统计</span>
              </div>
            </div>
          </template>

          <div class="stats-summary">
            <div class="stat-item primary">
              <div class="stat-label">课程费用</div>
              <div class="stat-value">¥{{ statistics.course_total || 0 }}</div>
            </div>
            <div class="stat-item success">
              <div class="stat-label">额外费用</div>
              <div class="stat-value">¥{{ statistics.extra_total || 0 }}</div>
            </div>
            <div class="stat-item warning">
              <div class="stat-label">总计费用</div>
              <div class="stat-value">¥{{ statistics.total_cost || 0 }}</div>
            </div>
          </div>

          <a-table
            v-if="statistics.course_statistics?.length"
            :data-source="statistics.course_statistics"
            :columns="courseStatsColumns"
            :pagination="false"
            :row-key="record => record.course_id ?? record.course_name"
            size="middle"
            style="margin-top: 24px"
          />

          <a-empty v-else description="暂无课程统计" style="margin-top: 24px" />
        </a-card>

        <a-card class="extra-card" bordered>
          <template #title>
            <div class="card-title">
              <div class="card-title-text">
                <span class="card-icon">🧾</span>
                <span>额外费用</span>
              </div>
              <a-button type="primary" size="small" :disabled="!currentStudentId" @click="openExpenseDialog()">
                ➕ 添加费用
              </a-button>
            </div>
          </template>

          <a-table
            v-if="extraExpenses.length"
            :data-source="extraExpenses"
            :columns="extraExpenseColumns"
            :pagination="false"
            :row-key="record => record.uid"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'actions'">
                <a-space>
                  <a-button type="link" @click="openExpenseDialog(record)">编辑</a-button>
                  <a-popconfirm title="确定删除该费用吗？" @confirm="deleteExpense(record.uid)">
                    <a-button type="link" danger>删除</a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </template>
          </a-table>
          <a-empty v-else description="暂无额外费用" />
        </a-card>
      </main>
    </div>

    <!-- 课程管理 -->
    <a-modal
      v-model:visible="courseModalOpen"
      title="📖 课程管理"
      width="960px"
      :destroy-on-close="true"
      @after-close="cancelEditCourse"
    >
      <template #footer>
        <a-space>
          <a-button @click="courseModalOpen = false">关闭</a-button>
          <a-button type="primary" @click="saveCourse">{{ editingCourse ? '保存修改' : '添加课程' }}</a-button>
        </a-space>
      </template>

      <a-spin :spinning="coursesLoading">
        <a-table
          v-if="courses.length"
          :columns="courseColumns"
          :data-source="courses"
          :pagination="false"
          size="middle"
          row-key="id"
          style="margin-bottom: 24px"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'price'">
              ¥{{ record.price }}
            </template>
            <template v-else-if="column.key === 'color'">
              <a-tag :color="getCourseColor(record.css_class)">{{ colorLabelMap[record.css_class] || record.css_class }}</a-tag>
            </template>
            <template v-else-if="column.key === 'actions'">
              <a-space>
                <a-button type="link" @click="editCourse(record)">编辑</a-button>
                <a-popconfirm title="确定删除此课程吗？" @confirm="deleteCourse(record.id)">
                  <a-button type="link" danger>删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
        <a-empty v-else description="暂无课程数据" style="margin-bottom: 24px" />

        <a-divider> {{ editingCourse ? '编辑课程' : '新增课程' }} </a-divider>

        <a-form layout="vertical">
          <a-row :gutter="16">
            <a-col :xs="24" :md="12">
              <a-form-item label="课程名称" required>
                <a-input v-model:value="courseForm.name" placeholder="例如：数学晚课" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item label="上课时间" required>
                <a-input v-model:value="courseForm.time" placeholder="例如：20:00-21:30" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item label="课时费用 (元)" required>
                <a-input-number
                  v-model:value="courseForm.price"
                  :min="0"
                  :step="50"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item label="课程颜色">
                <a-select v-model:value="courseForm.css_class" :options="colorOptions" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="课程描述">
                <a-textarea
                  v-model:value="courseForm.description"
                  :auto-size="{ minRows: 3, maxRows: 6 }"
                  placeholder="选填，例如：AEIS 数学冲刺课程"
                  maxlength="200"
                  show-count
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-spin>
    </a-modal>

    <!-- 手动添加课程 -->
    <a-modal
      v-model:visible="addModalOpen"
      title="➕ 添加课程"
      :destroy-on-close="true"
      @ok="addSchedule"
      @cancel="resetAddForm"
    >
      <a-form layout="vertical">
        <a-form-item label="上课日期">
          <a-input :value="selectedDate" disabled />
        </a-form-item>
        <a-form-item label="选择课程" required>
          <a-select
            v-model:value="addForm.courseId"
            :options="courseSelectOptions"
            placeholder="请选择课程"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 快捷批量添加 -->
    <a-modal
      v-model:visible="quickAddModalOpen"
      title="⚡ 快捷批量添加"
      :destroy-on-close="true"
      @ok="quickAddSchedules"
      @cancel="resetQuickAddForm"
    >
      <a-alert
        message="此功能会在当月指定星期的所有日期添加选中的课程"
        type="info"
        show-icon
        style="margin-bottom: 16px"
      />
      <a-form layout="vertical">
        <a-form-item label="选择课程" required>
          <a-select
            v-model:value="quickAddForm.courseId"
            :options="courseSelectOptions"
            placeholder="请选择课程"
          />
        </a-form-item>
        <a-form-item label="选择星期" required>
          <a-select v-model:value="quickAddForm.dayOfWeek" :options="weekDayOptions" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 新增/编辑额外费用 -->
    <a-modal
      v-model:visible="expenseModalOpen"
      :title="editingExpense ? '✏️ 编辑额外费用' : '➕ 新增额外费用'"
      :destroy-on-close="true"
      @ok="saveExpense"
      @cancel="resetExpenseForm"
    >
      <a-form layout="vertical">
        <a-form-item label="费用名称" required>
          <a-input v-model:value="expenseForm.name" placeholder="例如：教材费" />
        </a-form-item>
        <a-form-item label="费用日期" required>
          <a-date-picker v-model:value="expenseForm.expense_date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
        </a-form-item>
        <a-form-item label="金额 (元)" required>
          <a-input-number v-model:value="expenseForm.amount" :min="0" :step="50" style="width: 100%" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="expenseForm.notes" :auto-size="{ minRows: 3, maxRows: 6 }" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import dayjs from 'dayjs';
import { message } from 'ant-design-vue';
import http from '../api/http';

const students = ref([]);
const currentStudentId = ref();
const selectedMonth = ref(dayjs().format('YYYY-MM'));

const courses = ref([]);
const coursesLoading = ref(false);
const courseModalOpen = ref(false);
const addModalOpen = ref(false);
const quickAddModalOpen = ref(false);
const expenseModalOpen = ref(false);

const isDirty = ref(false);

const lessonsMap = reactive({}); // { 'YYYY-MM-DD': [{ uid, course_id, course_name, course_time, course_price, course_css_class }] }
const extraExpenses = ref([]); // [{ uid, name, amount, expense_date, notes }]

const editingCourse = ref(null);
const courseForm = reactive({
  name: '',
  time: '',
  price: 0,
  css_class: 'blue',
  description: '',
});

const addForm = reactive({
  courseId: null,
});
const selectedDate = ref('');

const quickAddForm = reactive({
  courseId: null,
  dayOfWeek: 1,
});

const expenseForm = reactive({
  uid: '',
  name: '',
  expense_date: dayjs().format('YYYY-MM-DD'),
  amount: 0,
  notes: '',
});
const editingExpense = ref(null);

const draggedCourse = ref(null);

const studentOptions = computed(() => students.value.map((s) => ({ label: s.name, value: s.id })));
const currentStudent = computed(() => students.value.find((s) => s.id === currentStudentId.value));
const currentStudentName = computed(() => currentStudent.value?.name || '');
const formattedMonth = computed(() => dayjs(selectedMonth.value).format('YYYY年MM月'));
const totalLessons = computed(() =>
  Object.values(lessonsMap).reduce((count, lessons) => {
    if (!Array.isArray(lessons)) return count;
    return count + lessons.length;
  }, 0)
);

const courseSelectOptions = computed(() =>
  courses.value.map((course) => ({
    label: `${course.name} (${course.time}) - ¥${course.price}`,
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

const weekDays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

const calendarMatrix = computed(() => {
  const ym = dayjs(selectedMonth.value, 'YYYY-MM');
  if (!ym.isValid()) return [];

  const startOfMonth = ym.startOf('month');
  const endOfMonth = ym.endOf('month');

  const weeks = [];
  let currentWeek = [];

  const startWeekday = (startOfMonth.day() + 6) % 7; // 调整成周一为起点
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

  if (currentWeek.length > 0) {
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

const statistics = computed(() => buildStatisticsPayload());

const extraExpenseColumns = [
  { title: '日期', dataIndex: 'expense_date', key: 'expense_date' },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '备注', dataIndex: 'notes', key: 'notes' },
  { title: '金额 (元)', dataIndex: 'amount', key: 'amount' },
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
  { title: '课时数', dataIndex: 'count', key: 'count' },
  { title: '单价 (元)', dataIndex: 'price_per_class', key: 'price_per_class' },
  { title: '小计 (元)', dataIndex: 'total', key: 'total' },
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

function createCalendarCell(dateObj, inCurrentMonth) {
  const dateStr = dateObj.format('YYYY-MM-DD');
  return {
    key: `${dateStr}-${inCurrentMonth ? 'in' : 'out'}`,
    date: dateStr,
    display: dateObj.date(),
    inCurrentMonth,
    isToday: dateObj.isSame(dayjs(), 'day'),
    isWeekend: [0, 6].includes(dateObj.day()),
    classes: inCurrentMonth ? lessonsMap[dateStr] || [] : [],
  };
}

function markDirty() {
  isDirty.value = true;
}

function resetState() {
  Object.keys(lessonsMap).forEach((key) => delete lessonsMap[key]);
  extraExpenses.value = [];
  isDirty.value = false;
}

function normalizeLesson(rawLesson) {
  return {
    uid: rawLesson.uid || generateUid('lesson'),
    course_id: rawLesson.course_id ?? null,
    course_name: rawLesson.course_name || '未命名课程',
    course_time: rawLesson.course_time || '',
    course_price: rawLesson.course_price ?? 0,
    course_css_class: rawLesson.course_css_class || 'blue',
  };
}

function normalizeExpense(rawExpense) {
  return {
    uid: rawExpense.uid || generateUid('expense'),
    name: rawExpense.name || '',
    expense_date: rawExpense.expense_date || dayjs().format('YYYY-MM-DD'),
    amount: Number(rawExpense.amount) || 0,
    notes: rawExpense.notes || '',
  };
}

function generateUid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function ensureLessonArray(dateStr) {
  if (!lessonsMap[dateStr]) {
    lessonsMap[dateStr] = [];
  }
  return lessonsMap[dateStr];
}

function addLessonToDate(dateStr, course) {
  if (!course) return;
  const lesson = {
    uid: generateUid('lesson'),
    course_id: course.id,
    course_name: course.name,
    course_time: course.time,
    course_price: course.price,
    course_css_class: course.css_class || 'blue',
  };
  const target = ensureLessonArray(dateStr);
  target.push(lesson);
  markDirty();
}

function deleteLesson(dateStr, uid) {
  const target = lessonsMap[dateStr];
  if (!target) return;
  const index = target.findIndex((item) => item.uid === uid);
  if (index !== -1) {
    target.splice(index, 1);
    if (target.length === 0) {
      delete lessonsMap[dateStr];
    }
    markDirty();
  }
}

function buildStatisticsPayload() {
  const statsMap = new Map();
  let courseTotal = 0;

  Object.values(lessonsMap).forEach((lessons) => {
    if (!Array.isArray(lessons)) return;
    lessons.forEach((lesson) => {
      const price = Number(lesson.course_price) || 0;
      courseTotal += price;
      const key = lesson.course_id ?? lesson.course_name ?? lesson.uid;
      const stat = statsMap.get(key) || {
        course_id: lesson.course_id ?? null,
        course_name: lesson.course_name || '未命名课程',
        count: 0,
        price_per_class: lesson.course_price ?? 0,
        total: 0,
        type: 'course',
      };
      stat.count += 1;
      stat.total += price;
      statsMap.set(key, stat);
    });
  });

  const courseStatistics = Array.from(statsMap.values()).sort((a, b) =>
    (a.course_name || '').localeCompare(b.course_name || '')
  );

  const normalizedExpenses = extraExpenses.value.map((expense) => ({
    uid: expense.uid,
    name: expense.name,
    amount: Number(expense.amount) || 0,
    expense_date: expense.expense_date,
    notes: expense.notes,
  }));

  const extraTotal = normalizedExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return {
    course_statistics: courseStatistics,
    course_total: courseTotal,
    extra_expenses: normalizedExpenses,
    extra_total: extraTotal,
    total_cost: courseTotal + extraTotal,
  };
}

function serializeLessons() {
  const result = {};
  Object.entries(lessonsMap).forEach(([dateStr, lessons]) => {
    result[dateStr] = lessons.map((lesson) => ({
      uid: lesson.uid,
      course_id: lesson.course_id,
      course_name: lesson.course_name,
      course_time: lesson.course_time,
      course_price: lesson.course_price,
      course_css_class: lesson.course_css_class,
    }));
  });
  return result;
}

function serializeExtraExpenses() {
  return extraExpenses.value.map((expense) => ({
    uid: expense.uid,
    name: expense.name,
    expense_date: expense.expense_date,
    amount: Number(expense.amount) || 0,
    notes: expense.notes,
  }));
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
  quickAddForm.dayOfWeek = 1;
  quickAddModalOpen.value = true;
  if (!courses.value.length) {
    message.info('当前暂未创建课程，请先在课程库中添加。');
  }
}

function quickAddSchedules() {
  if (!quickAddForm.courseId) {
    message.warning('请选择课程');
    return;
  }
  const course = courseMap.value.get(quickAddForm.courseId);
  if (!course) {
    message.error('课程不存在');
    return;
  }
  const dates = collectDatesByWeekday(quickAddForm.dayOfWeek);
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
  quickAddForm.dayOfWeek = 1;
}

function collectDatesByWeekday(dayOfWeek) {
  const ym = dayjs(selectedMonth.value, 'YYYY-MM');
  if (!ym.isValid()) return [];
  const start = ym.startOf('month');
  const end = ym.endOf('month');
  const result = [];
  let cursor = start;
  while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
    if (cursor.day() === dayOfWeek) {
      result.push(cursor.format('YYYY-MM-DD'));
    }
    cursor = cursor.add(1, 'day');
  }
  return result;
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
    expenseForm.notes = expense.notes;
  } else {
    editingExpense.value = null;
    expenseForm.uid = generateUid('expense');
    expenseForm.name = '';
    expenseForm.expense_date = dayjs().format('YYYY-MM-DD');
    expenseForm.amount = 0;
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
  expenseForm.notes = '';
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
    blue: 'blue',
    green: 'green',
    orange: 'orange',
    pink: 'pink',
    purple: 'purple',
  };
  return map[cssClass] || 'blue';
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
  courseModalOpen.value = true;
}

function cancelEditCourse() {
  editingCourse.value = null;
  Object.assign(courseForm, {
    name: '',
    time: '',
    price: 0,
    css_class: 'blue',
    description: '',
  });
}

async function saveCourse() {
  if (!courseForm.name || !courseForm.time || !courseForm.price) {
    message.warning('请填写完整课程信息');
    return;
  }

  try {
    if (editingCourse.value) {
      await http.put(`/api/courses/${editingCourse.value.id}`, courseForm);
      message.success('课程更新成功');
    } else {
      await http.post('/api/courses', courseForm);
      message.success('课程添加成功');
    }
    await loadCourses();
    cancelEditCourse();
  } catch (error) {
    message.error(`保存课程失败：${error.message}`);
  }
}

async function deleteCourse(id) {
  try {
    await http.delete(`/api/courses/${id}`);
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
  color: #e2e8f0;
}

.glass-panel {
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.72), rgba(30, 46, 65, 0.54));
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 20px 45px rgba(8, 18, 46, 0.55);
  backdrop-filter: blur(22px);
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
  background: radial-gradient(circle at top right, rgba(82, 196, 26, 0.25), transparent 55%);
  pointer-events: none;
}

.hero-text {
  position: relative;
  z-index: 1;
  max-width: 520px;
}

.hero-text h1 {
  font-size: 32px;
  margin: 0 0 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #f8fafc;
}

.hero-text p {
  margin: 0;
  font-size: 16px;
  color: rgba(226, 232, 240, 0.8);
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
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(120px, 1fr));
  gap: 18px;
}

.metric-item {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 16px;
  padding: 20px 18px;
  border: 1px solid rgba(94, 234, 212, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-label {
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.65);
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #f1f5f9;
}

.metric-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  background: rgba(226, 232, 240, 0.12);
  color: rgba(226, 232, 240, 0.9);
}

.metric-badge.dirty {
  background: rgba(248, 113, 113, 0.18);
  color: #fecaca;
}

.metric-badge.clean {
  background: rgba(74, 222, 128, 0.18);
  color: #bbf7d0;
}

.toolbar-card {
  padding: 20px 32px;
}

.toolbar-actions {
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.toolbar-select {
  width: 240px;
}

.content-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  padding: 24px 32px 48px;
  flex: 1;
}

.course-panel {
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.85), rgba(21, 37, 59, 0.75));
  border-radius: 18px;
  box-shadow: 0 24px 60px rgba(7, 18, 36, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.18);
  padding: 26px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #e2e8f0;
}

.panel-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #f8fafc;
}

.panel-header p {
  margin: 0;
  color: rgba(226, 232, 240, 0.6);
  font-size: 13px;
}

.course-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.course-card {
  cursor: grab;
  border: none;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.course-card :deep(.ant-card-body) {
  background: radial-gradient(circle at top, rgba(30, 64, 175, 0.28), rgba(15, 23, 42, 0.9));
  border: 1px solid rgba(59, 130, 246, 0.18);
  border-radius: 14px;
  color: #e0f2fe;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 36px rgba(30, 64, 175, 0.35);
}

.course-card-title {
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.01em;
}

.course-card-meta {
  display: flex;
  justify-content: space-between;
  color: rgba(226, 232, 240, 0.72);
  font-size: 13px;
  margin-top: 8px;
}

.course-price {
  color: #34d399;
  font-weight: 600;
}

.main-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.calendar-card,
.stats-card,
.extra-card {
  border-radius: 20px;
  background: linear-gradient(150deg, rgba(15, 23, 42, 0.82), rgba(17, 24, 39, 0.88));
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 28px 60px rgba(8, 18, 46, 0.55);
  color: #e2e8f0;
}

.calendar-card :deep(.ant-card-head),
.stats-card :deep(.ant-card-head),
.extra-card :deep(.ant-card-head) {
  background: transparent;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  color: #f8fafc;
  font-size: 18px;
  padding: 20px 24px;
}

.calendar-card :deep(.ant-card-body),
.stats-card :deep(.ant-card-body),
.extra-card :deep(.ant-card-body) {
  padding: 24px;
}

.calendar-card :deep(.ant-table),
.stats-card :deep(.ant-table),
.extra-card :deep(.ant-table) {
  background: transparent;
  color: #e2e8f0;
}

.calendar-card :deep(.ant-table-thead > tr > th),
.stats-card :deep(.ant-table-thead > tr > th),
.extra-card :deep(.ant-table-thead > tr > th) {
  background: rgba(15, 23, 42, 0.92) !important;
  color: rgba(226, 232, 240, 0.86);
  border-color: rgba(148, 163, 184, 0.18);
}

.calendar-card :deep(.ant-table-tbody > tr > td),
.stats-card :deep(.ant-table-tbody > tr > td),
.extra-card :deep(.ant-table-tbody > tr > td) {
  background: rgba(15, 23, 42, 0.65);
  border-color: rgba(148, 163, 184, 0.12);
  color: #e2e8f0;
}

.calendar-card :deep(.ant-empty-description),
.stats-card :deep(.ant-empty-description),
.extra-card :deep(.ant-empty-description) {
  color: rgba(226, 232, 240, 0.6);
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title-text {
  display: flex;
  align-items: center;
  gap: 8px;
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
  padding: 8px 0;
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
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.45);
}

.calendar-cell.drag-over,
.calendar-cell:hover {
  border-color: rgba(82, 196, 26, 0.75);
  box-shadow: 0 12px 24px rgba(82, 196, 26, 0.18), inset 0 0 0 1px rgba(82, 196, 26, 0.25);
  transform: translateY(-2px);
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

.cell-add-btn {
  padding: 0;
  color: #a5f3fc;
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
  border: 1px solid rgba(59, 130, 246, 0.35);
  color: #e0f2fe;
}

.class-tag :deep(.ant-tag-close-icon) {
  color: rgba(226, 232, 240, 0.8);
}

.class-tag-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.class-tag-text strong {
  font-size: 14px;
}

.class-tag-text span {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.cell-empty {
  color: rgba(148, 163, 184, 0.6);
  text-align: center;
  margin-top: 12px;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.stat-item {
  border-radius: 16px;
  padding: 18px 20px;
  background: linear-gradient(160deg, rgba(30, 64, 175, 0.22), rgba(59, 130, 246, 0.12));
  border: 1px solid rgba(96, 165, 250, 0.24);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.stat-item.primary {
  background: linear-gradient(160deg, rgba(30, 64, 175, 0.35), rgba(29, 78, 216, 0.18));
  border-color: rgba(129, 140, 248, 0.35);
}

.stat-item.warning {
  background: linear-gradient(160deg, rgba(245, 158, 11, 0.26), rgba(251, 191, 36, 0.18));
  border-color: rgba(251, 191, 36, 0.32);
}

.stat-label {
  font-size: 14px;
  color: rgba(226, 232, 240, 0.72);
  letter-spacing: 0.02em;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  margin-top: 8px;
  color: #fef9c3;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .course-panel {
    order: 2;
  }

  .main-panel {
    order: 1;
  }
}

@media (max-width: 768px) {
  .page-hero {
    flex-direction: column;
    align-items: flex-start;
    padding: 28px 24px;
  }

  .hero-metrics {
    width: 100%;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }

  .toolbar-card {
    padding: 20px 24px;
  }

  .content-grid {
    padding: 20px;
  }

  .calendar-grid {
    gap: 8px;
  }

  .calendar-cell {
    min-height: 120px;
    padding: 10px;
  }
}

@media (max-width: 576px) {
  .page-hero {
    padding: 24px 18px;
  }

  .toolbar-card {
    padding: 18px;
  }

  .content-grid {
    padding: 16px;
  }

  .course-panel {
    padding: 18px;
  }
}
</style>
