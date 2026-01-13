<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">
          {{ studentName ? `${studentName} 的成绩档案` : '学生成绩档案' }}
        </h1>
        <p v-if="studentInfo" class="text-gray-500 mt-1">
          学号: {{ studentInfo.student_id || '-' }} | 年级: {{ studentInfo.grade_level || '-' }}
        </p>
      </div>
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
          <div v-if="record.grade_type === '1'" class="flex gap-2">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
              A: {{ record.score_details.section_a }}
            </span>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
              B: {{ record.score_details.section_b }}
            </span>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
              C: {{ record.score_details.section_c }}
            </span>
          </div>
          <div v-else class="flex gap-2">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
              P1: {{ record.score_details.paper_1 }}
            </span>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
              P2: {{ record.score_details.paper_2 }}
            </span>
          </div>
        </template>
        <template v-if="column.key === 'total'">
          <span class="font-bold text-blue-600 text-lg">{{ record.total_score }}</span>
        </template>
        <template v-if="column.key === 'action'">
          <a-button type="link" @click="editGrade(record)" class="p-0">编辑</a-button>
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
import { studentApi } from '../../api/student';

const route = useRoute();
const router = useRouter();
const studentId = route.params.id;
const loading = ref(false);
const grades = ref([]);
const studentInfo = ref(null);
const studentName = ref('');

const columns = [
  { 
    title: '试卷名称', 
    dataIndex: 'paper_name', 
    key: 'paper_name',
    customHeaderCell: () => ({ style: { 'white-space': 'nowrap' } })
  },
  { 
    title: '年份', 
    dataIndex: 'paper_year', 
    key: 'paper_year',
    width: 80,
    align: 'center'
  },
  { 
    title: '类型', 
    dataIndex: 'grade_type', 
    key: 'grade_type',
    width: 150,
    customHeaderCell: () => ({ style: { 'white-space': 'nowrap' } })
  },
  { 
    title: '分项成绩', 
    key: 'details',
    customHeaderCell: () => ({ style: { 'white-space': 'nowrap' } })
  },
  { 
    title: '总分', 
    key: 'total',
    width: 80,
    align: 'center',
    customHeaderCell: () => ({ style: { 'white-space': 'nowrap' } })
  },
  { 
    title: '录入时间', 
    dataIndex: 'created_at', 
    key: 'created_at', 
    width: 120,
    customRender: ({ text }) => text ? new Date(text).toLocaleDateString() : '-' 
  },
  { 
    title: '评语', 
    dataIndex: 'comments', 
    key: 'comments',
    customCell: () => ({ style: { 'white-space': 'normal', 'word-break': 'break-all' } })
  },
  { 
    title: '操作', 
    key: 'action',
    width: 80,
    align: 'center'
  }
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

const fetchStudentInfo = async () => {
  try {
    const res = await studentApi.getStudent(studentId);
    if (res && res.data) {
      studentInfo.value = res.data;
      studentName.value = res.data.name || '';
    }
  } catch (error) {
    console.error('获取学生信息失败:', error);
    // 不显示错误提示，允许页面继续加载成绩数据
  }
};

const editGrade = (record) => {
  router.push({
    path: '/grades/entry',
    query: { id: record.id }
  });
};

const goToAnalysis = () => {
  router.push(`/students/${studentId}/analysis`);
};

onMounted(() => {
  fetchStudentInfo();
  fetchGrades();
});
</script>
