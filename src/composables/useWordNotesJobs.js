import { ref, reactive } from 'vue';
import dayjs from 'dayjs';
import { listJobs, getJobDetail } from '../api/wordNotes.js';

export function useWordNotesJobs() {
  const filters = reactive({
    classId: '',
    status: undefined,
    search: '',
    dateRange: [],
  });

  const jobs = ref([]);
  const loading = ref(false);
  const pagination = reactive({ page: 1, pageSize: 10, total: 0 });
  const detail = ref(null);
  const detailVisible = ref(false);
  const lastError = ref(null);

  const buildParams = (pageOverride) => {
    const params = {
      page: pageOverride ?? pagination.page,
      pageSize: pagination.pageSize,
    };

    if (filters.classId.trim()) {
      params.classId = filters.classId.trim();
    }
    if (filters.status) {
      params.status = filters.status;
    }
    if (filters.search.trim()) {
      params.search = filters.search.trim();
    }
    if (
      filters.dateRange &&
      filters.dateRange.length === 2 &&
      filters.dateRange[0] &&
      filters.dateRange[1]
    ) {
      params.dateFrom = filters.dateRange[0].startOf('day').toISOString();
      params.dateTo = filters.dateRange[1].endOf('day').toISOString();
    }

    return params;
  };

  const fetchJobs = async (pageOverride) => {
    loading.value = true;
    lastError.value = null;
    if (typeof pageOverride === 'number') {
      pagination.page = pageOverride;
    }

    try {
      const params = buildParams(pageOverride);
      const response = await listJobs(params);
      jobs.value = response.items || [];
      pagination.total = response.total || 0;
      pagination.page = response.page || params.page;
      pagination.pageSize = response.pageSize || pagination.pageSize;
      return true;
    } catch (err) {
      lastError.value = err;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const openDetail = async (taskId) => {
    try {
      const response = await getJobDetail(taskId);
      detail.value = response;
      detailVisible.value = true;
      return true;
    } catch (err) {
      lastError.value = err;
      return false;
    }
  };

  const closeDetail = () => {
    detail.value = null;
    detailVisible.value = false;
  };

  const resetFilters = () => {
    filters.classId = '';
    filters.status = undefined;
    filters.search = '';
    filters.dateRange = [];
  };

  const withApiPrefix = (path = '') => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/api/')) return path;
    return path.startsWith('/') ? `/api${path}` : `/api/${path}`;
  };

  return {
    filters,
    jobs,
    loading,
    pagination,
    detail,
    detailVisible,
    lastError,
    fetchJobs,
    openDetail,
    closeDetail,
    resetFilters,
    withApiPrefix,
  };
}
