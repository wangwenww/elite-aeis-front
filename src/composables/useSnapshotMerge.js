import { computed, ref } from 'vue';
import dayjs from 'dayjs';
import { message } from 'ant-design-vue';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { snapshotApi } from '../api/snapshot';

function sumTotalsList(source = []) {
  const map = new Map();
  source.forEach((item) => {
    const currency = item?.currency || 'CNY';
    const amount = Number(item?.amount || 0);
    map.set(currency, (map.get(currency) || 0) + amount);
  });
  return map;
}

function mergeMaps(...maps) {
  const result = new Map();
  maps.forEach((map) => {
    map.forEach((value, currency) => {
      result.set(currency, (result.get(currency) || 0) + value);
    });
  });
  return result;
}

function mapToArray(map) {
  return Array.from(map.entries()).map(([currency, amount]) => ({
    currency,
    amount: Number(amount.toFixed(2)),
  }));
}

function getCurrencySymbol(currency = 'CNY') {
  const lookup = {
    CNY: '¥',
    SGD: 'S$',
    USD: '$',
  };
  return lookup[currency] || `${currency} `;
}

function formatAmount(amount, currency = 'CNY') {
  const value = Number(amount) || 0;
  return `${getCurrencySymbol(currency)}${value.toFixed(2)}`;
}

function formatTotalsList(totals = []) {
  if (!Array.isArray(totals) || !totals.length) {
    return formatAmount(0, 'CNY');
  }
  return totals.map(({ currency, amount }) => formatAmount(amount, currency)).join(' / ');
}

export function useSnapshotMerge() {
  const snapshots = ref([]);
  const loading = ref(false);
  const exporting = ref(false);
  const temporaryAdjustments = ref([]);
  const adjustmentUid = ref(1);

  async function loadSnapshotsByIds(ids = []) {
    if (!ids.length) {
      snapshots.value = [];
      return;
    }
    loading.value = true;
    try {
      const responses = await Promise.all(
        ids.map(async (id) => {
          const { data } = await snapshotApi.getSnapshotItem(id);
          return data;
        }),
      );
      snapshots.value = responses
        .map((item) => ({
          ...item,
          statistics: {
            course_statistics: item.statistics?.course_statistics || [],
            course_totals: item.statistics?.course_totals || [],
            extra_expenses: item.statistics?.extra_expenses || [],
            extra_totals: item.statistics?.extra_totals || [],
            grand_totals: item.statistics?.grand_totals || [],
          },
        }))
        .sort((a, b) => {
          const monthA = dayjs(a.year_month, 'YYYY-MM');
          const monthB = dayjs(b.year_month, 'YYYY-MM');
          if (!monthA.isValid() || !monthB.isValid()) {
            return (monthA.isValid() ? 1 : 0) - (monthB.isValid() ? 1 : 0);
          }
          return monthA.valueOf() - monthB.valueOf();
        });
    } catch (error) {
      console.error(error);
      message.error(`加载快照失败：${error.message}`);
      snapshots.value = [];
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function addAdjustment(payload) {
    const amount = Number(payload.amount);
    if (Number.isNaN(amount)) {
      message.warning('请输入有效的金额');
      return false;
    }
    temporaryAdjustments.value.push({
      uid: `adjust-${adjustmentUid.value++}`,
      name: payload.name?.trim() || '临时调整',
      amount,
      currency: payload.currency || 'CNY',
      date: payload.date || dayjs().format('YYYY-MM-DD'),
      notes: payload.notes?.trim() || '',
    });
    return true;
  }

  function removeAdjustment(uid) {
    temporaryAdjustments.value = temporaryAdjustments.value.filter((item) => item.uid !== uid);
  }

  const aggregatedCourseTotalsMap = computed(() =>
    sumTotalsList(
      snapshots.value.flatMap((snap) => snap.statistics?.course_totals || []),
    ),
  );

  const aggregatedExtraTotalsMap = computed(() =>
    sumTotalsList(
      snapshots.value.flatMap((snap) => snap.statistics?.extra_totals || []),
    ),
  );

  const aggregatedGrandTotalsMap = computed(() =>
    sumTotalsList(
      snapshots.value.flatMap((snap) => snap.statistics?.grand_totals || []),
    ),
  );

  const adjustmentTotalsMap = computed(() => sumTotalsList(temporaryAdjustments.value));

  const combinedTotalsMap = computed(() =>
    mergeMaps(aggregatedGrandTotalsMap.value, adjustmentTotalsMap.value),
  );

  const aggregatedCourseTotals = computed(() => mapToArray(aggregatedCourseTotalsMap.value));
  const aggregatedExtraTotals = computed(() => mapToArray(aggregatedExtraTotalsMap.value));
  const aggregatedGrandTotals = computed(() => mapToArray(aggregatedGrandTotalsMap.value));
  const adjustmentTotals = computed(() => mapToArray(adjustmentTotalsMap.value));
  const combinedTotals = computed(() => mapToArray(combinedTotalsMap.value));

  async function exportMergedPdf(targetEl, filename = 'merged-invoice.pdf') {
    if (!targetEl) {
      message.error('未找到导出内容，请稍候重试');
      return;
    }
    exporting.value = true;
    try {
      const scale = Math.min(Math.max(window.devicePixelRatio || 2, 2), 3);
      const canvas = await html2canvas(targetEl, {
        scale,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
      message.success('PDF 导出成功');
    } catch (error) {
      console.error(error);
      message.error(`导出失败：${error?.message || '未知错误'}`);
    } finally {
      exporting.value = false;
    }
  }

  return {
    snapshots,
    loading,
    exporting,
    temporaryAdjustments,
    loadSnapshotsByIds,
    addAdjustment,
    removeAdjustment,
    aggregatedCourseTotals,
    aggregatedExtraTotals,
    aggregatedGrandTotals,
    adjustmentTotals,
    combinedTotals,
    formatAmount,
    formatTotalsList,
    exportMergedPdf,
  };
}

export default useSnapshotMerge;

