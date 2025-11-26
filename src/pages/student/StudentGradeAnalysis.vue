<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">学生成绩分析</h1>
    </div>

    <!-- 学生选择 -->
    <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
      <a-form layout="inline">
        <a-form-item label="选择学生">
          <a-select
            v-model:value="selectedStudentId"
            show-search
            placeholder="搜索学生"
            style="width: 300px"
            :options="studentOptions"
            :loading="studentsLoading"
            @change="loadGradeData"
          />
        </a-form-item>
      </a-form>
    </div>

    <!-- 视图切换 -->
    <div class="bg-white p-6 rounded-lg shadow-sm mb-6" v-if="gradeData">
      <a-radio-group v-model:value="viewMode" button-style="solid" size="large">
        <a-radio-button value="trend">总分趋势</a-radio-button>
        <a-radio-button value="details">分类详情</a-radio-button>
      </a-radio-group>
    </div>

    <!-- 视图 1: 总分趋势 -->
    <div v-if="viewMode === 'trend' && gradeData" class="bg-white p-6 rounded-lg shadow-sm">
      <h2 class="text-lg font-semibold mb-4">总分趋势图</h2>
      <div ref="trendChartRef" style="height: 400px"></div>
    </div>

    <!-- 视图 2: 分类详情 -->
    <div v-if="viewMode === 'details' && gradeData" class="bg-white p-6 rounded-lg shadow-sm">
      <h2 class="text-lg font-semibold mb-4">分类详情</h2>
      <a-tabs v-model:activeKey="detailTab">
        <a-tab-pane key="section" tab="Section A/B/C">
          <div ref="sectionChartRef" style="height: 400px"></div>
          <a-empty v-if="!gradeData.section_details || gradeData.section_details.length === 0" description="暂无 Section A/B/C 类型成绩" />
        </a-tab-pane>
        <a-tab-pane key="paper" tab="Paper 1/2">
          <div ref="paperChartRef" style="height: 400px"></div>
          <a-empty v-if="!gradeData.paper_details || gradeData.paper_details.length === 0" description="暂无 Paper 1/2 类型成绩" />
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 无数据提示 -->
    <div v-if="!gradeData && selectedStudentId" class="bg-white p-6 rounded-lg shadow-sm">
      <a-empty description="该学生暂无成绩数据" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import { Line, Column } from '@antv/g2plot';
import http from '../../api/http';

const selectedStudentId = ref(undefined);
const studentOptions = ref([]);
const studentsLoading = ref(false);
const gradeData = ref(null);
const viewMode = ref('trend');
const detailTab = ref('section');

// 图表实例
const trendChartRef = ref(null);
const sectionChartRef = ref(null);
const paperChartRef = ref(null);
let trendChart = null;
let sectionChart = null;
let paperChart = null;

// 加载学生列表
const loadStudents = async () => {
  studentsLoading.value = true;
  try {
    const res = await http.get('/api/students');
    const list = res.data.students || res.data;
    studentOptions.value = list.map(s => ({
      label: `${s.name} (${s.student_id || 'No ID'})`,
      value: s.id
    }));
  } catch (error) {
    message.error('加载学生列表失败: ' + error.message);
  } finally {
    studentsLoading.value = false;
  }
};

// 加载成绩数据
const loadGradeData = async () => {
  if (!selectedStudentId.value) return;
  
  try {
    const res = await http.get(`/api/grades/student/${selectedStudentId.value}/analysis`);
    gradeData.value = res.data;
    
    // 等待 DOM 更新后渲染图表
    await nextTick();
    renderCharts();
  } catch (error) {
    message.error('加载成绩数据失败: ' + error.message);
  }
};

// 渲染图表
const renderCharts = () => {
  if (viewMode.value === 'trend') {
    renderTrendChart();
  } else {
    if (detailTab.value === 'section') {
      renderSectionChart();
    } else {
      renderPaperChart();
    }
  }
};

// 渲染总分趋势图
const renderTrendChart = () => {
  if (!trendChartRef.value || !gradeData.value || !gradeData.value.total_trend || gradeData.value.total_trend.length === 0) {
    console.log('No trend data to render');
    return;
  }
  
  // 销毁旧图表
  if (trendChart) {
    try {
      trendChart.destroy();
      trendChart = null;
    } catch (e) {
      console.warn('Error destroying trend chart:', e);
    }
  }
  
  try {
    const data = gradeData.value.total_trend.map(item => ({
      name: `${item.paper_name} (${item.paper_year})`,
      value: item.total_score || 0
    }));
    
    console.log('Rendering trend chart with data:', data);
    
    // 确保容器已挂载且有尺寸
    const container = trendChartRef.value;
    if (!container.offsetWidth || !container.offsetHeight) {
      console.warn('Container not ready, retrying...');
      setTimeout(renderTrendChart, 100);
      return;
    }
    
    trendChart = new Line(container, {
      data,
      xField: 'name',
      yField: 'value',
      point: {
        size: 5,
        shape: 'circle',
      },
      yAxis: {
        min: 0,
        max: 100,
      },
      tooltip: {
        showMarkers: true,
      },
      smooth: true,
      animation: {
        appear: {
          animation: 'wave-in',
          duration: 800,
        },
      },
    });
    
    trendChart.render();
  } catch (error) {
    console.error('Error rendering trend chart:', error);
    message.error('图表渲染失败: ' + error.message);
  }
};

// 渲染 Section A/B/C 图表
const renderSectionChart = () => {
  if (!sectionChartRef.value || !gradeData.value || !gradeData.value.section_details || gradeData.value.section_details.length === 0) {
    console.log('No section data to render');
    return;
  }
  
  // 销毁旧图表
  if (sectionChart) {
    try {
      sectionChart.destroy();
      sectionChart = null;
    } catch (e) {
      console.warn('Error destroying section chart:', e);
    }
  }
  
  try {
    const container = sectionChartRef.value;
    if (!container.offsetWidth || !container.offsetHeight) {
      console.warn('Section container not ready, retrying...');
      setTimeout(renderSectionChart, 100);
      return;
    }
    
    // 转换数据为堆叠格式
    const data = [];
    gradeData.value.section_details.forEach(item => {
      data.push({ name: item.paper_name, type: 'Section A', value: item.section_a || 0 });
      data.push({ name: item.paper_name, type: 'Section B', value: item.section_b || 0 });
      data.push({ name: item.paper_name, type: 'Section C', value: item.section_c || 0 });
    });
    
    console.log('Rendering section chart with data:', data);
    
    sectionChart = new Column(container, {
      data,
      xField: 'name',
      yField: 'value',
      seriesField: 'type',
      isStack: true,
      animation: {
        appear: {
          animation: 'scale-in-y',
          duration: 600,
        },
      },
    });
    
    sectionChart.render();
  } catch (error) {
    console.error('Error rendering section chart:', error);
    message.error('Section 图表渲染失败: ' + error.message);
  }
};

// 渲染 Paper 1/2 图表
const renderPaperChart = () => {
  if (!paperChartRef.value || !gradeData.value || !gradeData.value.paper_details || gradeData.value.paper_details.length === 0) {
    console.log('No paper data to render');
    return;
  }
  
  // 销毁旧图表
  if (paperChart) {
    try {
      paperChart.destroy();
      paperChart = null;
    } catch (e) {
      console.warn('Error destroying paper chart:', e);
    }
  }
  
  try {
    const container = paperChartRef.value;
    if (!container.offsetWidth || !container.offsetHeight) {
      console.warn('Paper container not ready, retrying...');
      setTimeout(renderPaperChart, 100);
      return;
    }
    
    // 转换数据为分组格式
    const data = [];
    gradeData.value.paper_details.forEach(item => {
      data.push({ name: item.paper_name, type: 'Paper 1', value: item.paper_1 || 0 });
      data.push({ name: item.paper_name, type: 'Paper 2', value: item.paper_2 || 0 });
    });
    
    console.log('Rendering paper chart with data:', data);
    
    paperChart = new Column(container, {
      data,
      xField: 'name',
      yField: 'value',
      seriesField: 'type',
      isGroup: true,
      columnStyle: {
        radius: [4, 4, 0, 0],
      },
      animation: {
        appear: {
          animation: 'scale-in-y',
          duration: 600,
        },
      },
    });
    
    paperChart.render();
  } catch (error) {
    console.error('Error rendering paper chart:', error);
    message.error('Paper 图表渲染失败: ' + error.message);
  }
};

// 监听视图切换
watch(viewMode, async () => {
  await nextTick();
  renderCharts();
});

// 监听详情 Tab 切换
watch(detailTab, async () => {
  await nextTick();
  renderCharts();
});

onMounted(() => {
  loadStudents();
});
</script>
