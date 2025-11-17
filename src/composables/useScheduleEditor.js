import { computed, reactive, ref } from 'vue';
import dayjs from 'dayjs';

export function useScheduleEditor() {
  const selectedMonth = ref(dayjs().format('YYYY-MM'));
  const isDirty = ref(false);
  const lessonsMap = reactive({});
  const extraExpenses = ref([]);
  const draggedCourse = ref(null);

  const weekDays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

  const calendarMatrix = computed(() => {
    const ym = dayjs(selectedMonth.value, 'YYYY-MM');
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

  const formattedMonth = computed(() => dayjs(selectedMonth.value).format('YYYY年MM月'));

  const totalLessons = computed(() =>
    Object.values(lessonsMap).reduce((count, lessons) => {
      if (!Array.isArray(lessons)) return count;
      return count + lessons.length;
    }, 0),
  );

  const statistics = computed(() => buildStatisticsPayload());

  function markDirty() {
    isDirty.value = true;
  }

  function resetState() {
    Object.keys(lessonsMap).forEach((key) => delete lessonsMap[key]);
    extraExpenses.value = [];
    isDirty.value = false;
  }

  function addLessonToDate(dateStr, course) {
    if (!course) return;
    const lesson = {
      uid: generateUid('lesson'),
      course_id: course.id ?? null,
      course_name: course.name || '未命名课程',
      course_time: course.time || '',
      course_price: course.price ?? 0,
      course_currency: course.currency || 'CNY',
      course_css_class: course.css_class || 'blue',
    };
    const target = ensureLessonArray(dateStr);
    target.push(lesson);
    sortLessonsForDate(dateStr);
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

  function serializeLessons() {
    const result = {};
    Object.entries(lessonsMap).forEach(([dateStr, lessons]) => {
      result[dateStr] = lessons.map((lesson) => ({
        uid: lesson.uid,
        course_id: lesson.course_id,
        course_name: lesson.course_name,
        course_time: lesson.course_time,
        course_price: lesson.course_price,
        course_currency: lesson.course_currency || 'CNY',
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
      currency: expense.currency || 'CNY',
      notes: expense.notes,
    }));
  }

  function collectDatesByWeekday(dayOfWeekList) {
    const ym = dayjs(selectedMonth.value, 'YYYY-MM');
    if (!ym.isValid()) return [];
    const normalized = Array.isArray(dayOfWeekList) ? dayOfWeekList : [dayOfWeekList];
    const daySet = new Set(
      normalized
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6),
    );
    if (!daySet.size) return [];
    const start = ym.startOf('month');
    const end = ym.endOf('month');
    const result = [];
    let cursor = start;
    while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
      if (daySet.has(cursor.day())) {
        result.push(cursor.format('YYYY-MM-DD'));
      }
      cursor = cursor.add(1, 'day');
    }
    return result;
  }

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

  function ensureLessonArray(dateStr) {
    if (!lessonsMap[dateStr]) {
      lessonsMap[dateStr] = [];
    }
    return lessonsMap[dateStr];
  }

  function sortLessonsForDate(dateStr) {
    const lessons = lessonsMap[dateStr];
    if (!Array.isArray(lessons)) return;
    lessons.sort((a, b) => {
      const diff = getCourseStartMinutes(a.course_time) - getCourseStartMinutes(b.course_time);
      if (diff !== 0) return diff;
      return (a.course_name || '').localeCompare(b.course_name || '');
    });
  }

  function getCourseStartMinutes(timeRange) {
    if (!timeRange) return Number.MAX_SAFE_INTEGER;
    const [start] = timeRange.split(/-|~|–|—/);
    if (!start) return Number.MAX_SAFE_INTEGER;
    const parts = start.trim().split(':');
    const hours = Number(parts[0]);
    const minutes = parts.length > 1 ? Number(parts[1]) : 0;
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return Number.MAX_SAFE_INTEGER;
    }
    return hours * 60 + minutes;
  }

  function buildStatisticsPayload() {
    const statsMap = new Map();
    const courseTotals = new Map();

    const addTotal = (map, currency, amount) => {
      map.set(currency, (map.get(currency) || 0) + amount);
    };

    const totalsToArray = (map) => Array.from(map.entries()).map(([currency, amount]) => ({ currency, amount }));

    const pickPrimary = (map) => {
      if (map.size === 0) return 0;
      if (map.size === 1) return map.values().next().value;
      const preferred = ['SGD', 'CNY', 'USD'];
      for (const currency of preferred) {
        if (map.has(currency)) return map.get(currency) || 0;
      }
      return map.values().next().value || 0;
    };

    Object.values(lessonsMap).forEach((lessons) => {
      if (!Array.isArray(lessons)) return;
      lessons.forEach((lesson) => {
        const price = Number(lesson.course_price) || 0;
        const currency = lesson.course_currency || lesson.currency || 'CNY';
        addTotal(courseTotals, currency, price);

        const key = `${lesson.course_id ?? lesson.course_name ?? lesson.uid}_${currency}`;
        const stat =
          statsMap.get(key) ||
          {
            course_id: lesson.course_id ?? null,
            course_name: lesson.course_name || '未命名课程',
            count: 0,
            price_per_class: lesson.course_price ?? 0,
            total: 0,
            currency,
            type: 'course',
            course_time: lesson.course_time || '',
          };
        stat.count += 1;
        stat.total += price;
        if (lesson.course_name) stat.course_name = lesson.course_name;
        if (lesson.course_price != null) stat.price_per_class = lesson.course_price;
        if (lesson.course_time && !stat.course_time) stat.course_time = lesson.course_time;
        statsMap.set(key, stat);
      });
    });

    const courseStatistics = Array.from(statsMap.values()).sort((a, b) => {
      const nameDiff = (a.course_name || '').localeCompare(b.course_name || '');
      if (nameDiff !== 0) return nameDiff;
      return (a.currency || '').localeCompare(b.currency || '');
    });

    const normalizedExpenses = extraExpenses.value.map((expense) => ({
      uid: expense.uid,
      name: expense.name,
      expense_date: expense.expense_date,
      amount: Number(expense.amount) || 0,
      currency: expense.currency || 'CNY',
      notes: expense.notes,
    }));

    const extraTotals = new Map();
    normalizedExpenses.forEach((expense) => {
      addTotal(extraTotals, expense.currency, Number(expense.amount) || 0);
    });

    const grandTotals = new Map(courseTotals);
    extraTotals.forEach((amount, currency) => {
      addTotal(grandTotals, currency, amount);
    });

    return {
      course_statistics: courseStatistics,
      course_totals: totalsToArray(courseTotals),
      extra_expenses: normalizedExpenses,
      extra_totals: totalsToArray(extraTotals),
      grand_totals: totalsToArray(grandTotals),
      course_total: pickPrimary(courseTotals),
      extra_total: pickPrimary(extraTotals),
      total_cost: pickPrimary(grandTotals),
    };
  }

  return {
    selectedMonth,
    isDirty,
    lessonsMap,
    extraExpenses,
    draggedCourse,
    weekDays,
    calendarMatrix,
    flatCalendar,
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
  };
}

export function generateUid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

