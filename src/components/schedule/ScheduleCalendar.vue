<template>
  <a-card class="calendar-card" :bordered="false">
    <template #title>
      <div class="card-title">
        <span class="card-icon">📅</span>
        <span>课程日历</span>
        <div class="card-title-tags">
          <a-tag v-if="currentStudentName" color="blue">学生：{{ currentStudentName }}</a-tag>
          <a-tag color="default">{{ formattedMonth }}</a-tag>
        </div>
      </div>
    </template>

    <div class="calendar-scroll-wrapper" v-if="cells.length">
      <div class="calendar-grid">
        <div class="calendar-header" v-for="dayLabel in weekDays" :key="`header-${dayLabel}`">{{ dayLabel }}</div>

        <div
          v-for="day in cells"
          :key="day.key"
          class="calendar-cell"
          :class="{ 'is-today': day.isToday, 'is-other-month': !day.inCurrentMonth }"
          @dragover.prevent="event => emit('drag-over', event, day)"
          @dragleave="event => emit('drag-leave', event)"
          @drop.prevent="event => emit('drop', event, day)"
        >
          <div class="cell-header">
            <span class="cell-date" :class="{ weekend: day.isWeekend }">{{ day.display }}</span>
            <a-button
              v-if="day.inCurrentMonth"
              size="small"
              type="default"
              class="cell-add-btn"
              @click.stop="emit('open-add', day.date)"
            >
              <template #icon><PlusOutlined /></template>
              添加
            </a-button>
          </div>

          <div v-if="day.classes.length" class="cell-classes">
            <a-tag
              v-for="cls in day.classes"
              :key="cls.uid"
              :style="getCourseStyle(cls.course_css_class)"
              class="class-tag"
              closable
              @close="emit('delete-lesson', day.date, cls.uid)"
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
    </div>

    <a-empty v-else description="请选择学生或创建课程后，开始制定本月课表" />
  </a-card>
</template>

<script setup>
import { computed } from 'vue';
import dayjs from 'dayjs';
import { PlusOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  weekDays: {
    type: Array,
    default: () => ['一', '二', '三', '四', '五', '六', '日'],
  },
  flatCalendar: {
    type: Array,
    default: () => [],
  },
  calendarMatrix: {
    type: Array,
    default: () => [],
  },
  selectedMonth: {
    type: String,
    default: '',
  },
  currentStudentName: {
    type: String,
    default: '',
  },
  formattedMonth: {
    type: String,
    default: '',
  },
  getCourseColor: {
    type: Function,
    required: true,
  },
});

const colorMap = {
  blue: { bg: '#eff6ff', border: '#2563eb', text: '#1e3a8a' },
  green: { bg: '#f0fdf4', border: '#16a34a', text: '#14532d' },
  orange: { bg: '#fff7ed', border: '#ea580c', text: '#7c2d12' },
  pink: { bg: '#fdf4ff', border: '#db2777', text: '#831843' },
  purple: { bg: '#faf5ff', border: '#9333ea', text: '#581c87' },
};

function getCourseStyle(cssClass) {
  const theme = colorMap[cssClass] || colorMap.blue;
  return {
    backgroundColor: theme.bg,
    borderLeftColor: theme.border,
    color: theme.text
  };
}

const weeks = computed(() => {
  const normalizedMatrix = normalizeMatrix(props.calendarMatrix);
  if (normalizedMatrix.length) {
    return normalizedMatrix;
  }
  const fallback = chunkFlatCalendar(props.flatCalendar);
  if (fallback.length) {
    return fallback;
  }
  return buildPlaceholderMatrix(props.selectedMonth || dayjs().format('YYYY-MM'));
});

const cells = computed(() => weeks.value.flat());

function normalizeMatrix(matrix) {
  if (!Array.isArray(matrix) || !matrix.length) return [];
  return matrix.map((week, weekIndex) => {
    if (!Array.isArray(week)) return [];
    return week.map((day, dayIndex) => normalizeDay(day, weekIndex * 7 + dayIndex));
  });
}

function chunkFlatCalendar(flat) {
  if (!Array.isArray(flat) || !flat.length) return [];
  const result = [];
  for (let i = 0; i < flat.length; i += 7) {
    const slice = flat.slice(i, i + 7).map((day, index) => normalizeDay(day, i + index));
    result.push(slice);
  }
  return result;
}

function buildPlaceholderMatrix(monthStr) {
  const ym = dayjs(monthStr, 'YYYY-MM', true);
  const base = ym.isValid() ? ym : dayjs();
  const startOfMonth = base.startOf('month');
  const endOfMonth = base.endOf('month');
  const startWeekday = (startOfMonth.day() + 6) % 7;

  const weeks = [];
  let currentWeek = [];

  for (let i = startWeekday; i > 0; i -= 1) {
    const dateObj = startOfMonth.subtract(i, 'day');
    currentWeek.push(createPlaceholderCell(dateObj, false));
  }

  let cursor = startOfMonth;
  while (cursor.isBefore(endOfMonth) || cursor.isSame(endOfMonth, 'day')) {
    currentWeek.push(createPlaceholderCell(cursor, true));
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
      currentWeek.push(createPlaceholderCell(dateObj, false));
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

function createPlaceholderCell(dateObj, inCurrentMonth) {
  const dateStr = dateObj.format('YYYY-MM-DD');
  return {
    key: `${dateStr}-${inCurrentMonth ? 'in' : 'out'}`,
    date: dateStr,
    display: dateObj.date(),
    inCurrentMonth,
    isToday: dateObj.isSame(dayjs(), 'day'),
    isWeekend: [0, 6].includes(dateObj.day()),
    classes: [],
  };
}

function normalizeDay(day, fallbackIndex) {
  if (!day || typeof day !== 'object') {
    const today = dayjs().add(fallbackIndex || 0, 'day');
    return createPlaceholderCell(today, false);
  }
  const dateStr = typeof day.date === 'string' ? day.date : dayjs().format('YYYY-MM-DD');
  const display = day.display ?? dayjs(dateStr).date();
  return {
    key: day.key ?? `${dateStr}-${day.inCurrentMonth ? 'in' : 'out'}`,
    date: dateStr,
    display,
    inCurrentMonth: Boolean(day.inCurrentMonth),
    isToday: Boolean(day.isToday),
    isWeekend: Boolean(day.isWeekend),
    classes: Array.isArray(day.classes) ? day.classes : [],
  };
}
</script>

<style scoped>
.calendar-scroll-wrapper {
  overflow-x: auto;
  padding-bottom: 8px;
  /* Custom scrollbar for better look */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.calendar-scroll-wrapper::-webkit-scrollbar {
  height: 8px;
}

.calendar-scroll-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.calendar-scroll-wrapper::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}

.calendar-card :deep(.ant-card-head) {
  background: transparent;
  border-bottom: 1px solid #e5e9f0;
  color: #102a43;
  font-size: 17px;
  padding: 18px 22px;
}

.calendar-card :deep(.ant-card-body) {
  padding: 22px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 600;
}

.card-title-tags {
  margin-left: auto;
  display: flex;
  gap: 8px;
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
  color: #64748b;
  letter-spacing: 0.02em;
}

.calendar-cell {
  background: #ffffff;
  border: 1px solid #e5e9f0;
  border-radius: 12px;
  padding: 12px;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.calendar-cell.is-today {
  border-color: #1d4ed8;
  box-shadow: 0 0 0 2px rgba(29, 78, 216, 0.15);
}

.calendar-cell.is-other-month {
  opacity: 0.45;
}

.calendar-cell.drag-over {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.25);
}

.cell-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cell-date {
  font-weight: 600;
  color: #111827;
}

.cell-date.weekend {
  color: #e11d48;
}

.cell-add-btn {
  padding: 0 4px;
  font-size: 12px;
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
  padding: 10px 14px;
  border-radius: 4px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-left-width: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.class-tag-text {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  line-height: 1.4;
  color: #111827;
}

.class-tag-text strong {
  font-size: 13px;
  font-weight: 600;
}

.cell-empty {
  text-align: center;
  color: #94a3b8;
  margin-top: 12px;
}

@media (max-width: 1280px) {
  .calendar-grid {
    grid-template-columns: repeat(7, minmax(100px, 1fr));
  }
}

@media (max-width: 960px) {
  .calendar-grid {
    grid-template-columns: repeat(7, minmax(90px, 1fr));
  }

  .calendar-cell {
    min-height: 120px;
    padding: 10px;
  }
}

@media (max-width: 768px) {
  .calendar-grid {
    grid-template-columns: repeat(7, minmax(72px, 1fr));
    gap: 8px;
  }
}
</style>
