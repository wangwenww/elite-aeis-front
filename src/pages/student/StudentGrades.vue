<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800">学生成绩档案</h1>
      <a-button type="primary" @click="goToAnalysis">
        <template #icon><line-chart-outlined /></template>
        成绩分析
      </a-button>
    </div>

    <a-table :columns="columns" :data-source="grades" :loading="loading" row-key="id">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'grade_type'">
          <a-tag :color="record.grade_type === '1' ? 'blue' : 'purple'">
            {{ record.grade_type === '1' ? 'Section A/B/C' : 'Paper 1/2' }}
          </a-tag>
        </template>
        <template v-if="column.key === 'details'">
          <div v-if="record.grade_type === '1'" class="text-sm">
            <span class="mr-2">A: {{ record.score_details.section_a }}</span>
            <span class="mr-2">B: {{ record.score_details.section_b }}</span>
            <span>C: {{ record.score_details.section_c }}</span>
          </div>
          <div v-else class="text-sm">
            <span class="mr-2">P1: {{ record.score_details.paper_1 }}</span>
            <span>P2: {{ record.score_details.paper_2 }}</span>
          </div>
        </template>
        <template v-if="column.key === 'total'">
          <span class="font-bold text-lg">{{ record.total_score }}</span>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { LineChartOutlined } from '@ant-design/icons-vue';
import { gradeApi } from '../../api/grade';

const route = useRoute();
const router = useRouter();
const studentId = route.params.id;
const loading = ref(false);
const grades = ref([]);

const columns = [
  { title: '试卷名称', dataIndex: 'paper_name', key: 'paper_name' },
  { title: '年份', dataIndex: 'paper_year', key: 'paper_year' },
  { title: '类型', dataIndex: 'grade_type', key: 'grade_type' },
  { title: '分项成绩', key: 'details' },
  { title: '总分', key: 'total' },
  { title: '录入时间', dataIndex: 'created_at', key: 'created_at' },
  { title: '评语', dataIndex: 'comments', key: 'comments' }
];

const fetchGrades = async () => {
  loading.value = true;
  try {
    const res = await gradeApi.getStudentGrades(studentId);
    grades.value = res.data;
  } catch (error) {
    message.error('获取成绩失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

const goToAnalysis = () => {
  router.push(`/students/${studentId}/analysis`);
};

onMounted(() => {
  fetchGrades();
});
</script>
