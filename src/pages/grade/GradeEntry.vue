<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? '修改成绩' : '成绩录入' }}</h1>
      <div class="flex gap-3">
        <a-button @click="handleBack">返回</a-button>
        <a-button v-if="!isEdit" type="dashed" size="large" @click="showAIModal" class="border-purple-500 text-purple-600 hover:border-purple-400">
          <template #icon><robot-outlined /></template>
          AI 助手
        </a-button>
      </div>
    </div>

    <div class="bg-white p-8 rounded-lg shadow-sm">
      <a-form layout="vertical" :model="formState" ref="formRef" @finish="handleSubmit">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a-form-item label="选择学生" name="student_id" :rules="[{ required: true, message: '请选择学生' }]">
            <a-select
              v-model:value="formState.student_id"
              show-search
              placeholder="搜索学生姓名"
              :filter-option="filterStudentOption"
              :options="allStudentsOptions"
              :loading="studentsLoading"
            />
          </a-form-item>

          <a-form-item label="试卷年份" name="paper_year">
            <a-input-number v-model:value="formState.paper_year" class="w-full" placeholder="例如：2024" />
          </a-form-item>
        </div>

        <a-form-item label="试卷名称" name="paper_name" :rules="[{ required: true, message: '请输入试卷名称' }]">
          <a-input v-model:value="formState.paper_name" placeholder="例如：ACS Primary 6 Prelim" />
        </a-form-item>

        <a-form-item label="成绩类型" name="grade_type" :rules="[{ required: true, message: '请选择成绩类型' }]">
          <a-radio-group v-model:value="formState.grade_type" button-style="solid">
            <a-radio-button value="1">Section A/B/C</a-radio-button>
            <a-radio-button value="2">Paper 1/2</a-radio-button>
          </a-radio-group>
        </a-form-item>

        <a-divider>分数详情</a-divider>

        <!-- Type 1: Section A/B/C -->
        <div v-if="formState.grade_type === '1'" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a-form-item label="Section A">
            <a-input-number v-model:value="formState.score_details.section_a" :min="0" class="w-full" />
          </a-form-item>
          <a-form-item label="Section B">
            <a-input-number v-model:value="formState.score_details.section_b" :min="0" class="w-full" />
          </a-form-item>
          <a-form-item label="Section C">
            <a-input-number v-model:value="formState.score_details.section_c" :min="0" class="w-full" />
          </a-form-item>
        </div>

        <!-- Type 2: Paper 1/2 -->
        <div v-if="formState.grade_type === '2'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a-form-item label="Paper 1">
            <a-input-number v-model:value="formState.score_details.paper_1" :min="0" class="w-full" />
          </a-form-item>
          <a-form-item label="Paper 2">
            <a-input-number v-model:value="formState.score_details.paper_2" :min="0" class="w-full" />
          </a-form-item>
        </div>

        <a-form-item label="评语" name="comments">
          <a-textarea v-model:value="formState.comments" :rows="4" placeholder="请输入评语..." />
        </a-form-item>

        <div class="flex justify-end mt-6 gap-3">
          <a-button size="large" @click="resetForm">重置</a-button>
          <a-button 
            type="primary" 
            html-type="submit" 
            :loading="submitting" 
            size="large"
            class="bg-blue-600 text-white hover:bg-blue-500 border-none"
          >
            提交成绩
          </a-button>
        </div>
      </a-form>
    </div>

    <!-- AI 助手弹窗 -->
    <a-modal
      v-model:open="aiModalVisible"
      title="AI 成绩助手"
      width="650px"
      @ok="parseWithAI"
      :confirmLoading="parsing"
      okText="解析"
      cancelText="取消"
    >
      <div class="mb-4">
        <p class="text-gray-600 text-sm mb-2">请输入成绩信息，例如：</p>
        <p class="text-gray-500 text-xs italic">"张三的2024年PSLE Prelim成绩，Section A 20分，Section B 35分，Section C 40分，表现优秀。"</p>
      </div>
      <a-textarea 
        v-model:value="naturalLanguageInput" 
        :rows="6" 
        placeholder="请输入成绩信息..."
        class="mb-4"
      />
      <a-alert v-if="parseError" :message="parseError" type="error" show-icon closable @close="parseError = ''" />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { RobotOutlined } from '@ant-design/icons-vue';
import { gradeApi } from '../../api/grade';
import { studentApi } from '../../api/student';

const route = useRoute();
const router = useRouter();
const formRef = ref(null);
const submitting = ref(false);
const studentsLoading = ref(false);
const allStudentsOptions = ref([]);

const gradeId = computed(() => route.query.id);
const isEdit = computed(() => !!gradeId.value);

const formState = reactive({
  student_id: undefined,
  paper_name: '',
  paper_year: new Date().getFullYear(),
  grade_type: '1',
  score_details: {},
  comments: ''
});

// AI 助手状态
const aiModalVisible = ref(false);
const naturalLanguageInput = ref('');
const parsing = ref(false);
const parseError = ref('');

// Reset score details when type changes (only if empty)
watch(() => formState.grade_type, (newType, oldType) => {
  // 如果是初始化或者 score_details 为空，才重置
  const isEmpty = !formState.score_details || Object.keys(formState.score_details).length === 0;
  
  if (isEmpty || !oldType) {
    if (newType === '1') {
      formState.score_details = { section_a: 0, section_b: 0, section_c: 0 };
    } else {
      formState.score_details = { paper_1: 0, paper_2: 0 };
    }
  } else {
    // 如果已有数据，检查是否需要转换格式
    const hasType1Keys = 'section_a' in formState.score_details;
    const hasType2Keys = 'paper_1' in formState.score_details;
    
    // 只有当类型不匹配时才重置
    if (newType === '1' && hasType2Keys) {
      formState.score_details = { section_a: 0, section_b: 0, section_c: 0 };
    } else if (newType === '2' && hasType1Keys) {
      formState.score_details = { paper_1: 0, paper_2: 0 };
    }
  }
}, { immediate: true });

const fetchGradeDetail = async () => {
  if (!gradeId.value) return;
  
  try {
    const res = await gradeApi.getGrade(gradeId.value);
    const data = res.data;
    formState.student_id = data.student_id;
    formState.paper_name = data.paper_name;
    formState.paper_year = data.paper_year;
    formState.grade_type = data.grade_type;
    formState.score_details = { ...data.score_details };
    formState.comments = data.comments;
  } catch (error) {
    message.error('获取成绩详情失败: ' + error.message);
  }
};

const fetchAllStudents = async () => {
  studentsLoading.value = true;
  try {
    const res = await studentApi.getStudents();
    const list = res.data.students || res.data;
    allStudentsOptions.value = list.map(s => ({
      label: `${s.name} (${s.student_id || 'No ID'})`,
      value: s.id
    }));
  } catch (error) {
    console.error(error);
  } finally {
    studentsLoading.value = false;
  }
};

const filterStudentOption = (input, option) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    if (isEdit.value) {
      await gradeApi.updateGrade(gradeId.value, formState);
      message.success('成绩修改成功');
    } else {
      await gradeApi.createGrade(formState);
      message.success('成绩录入成功');
    }
    
    // 提交成功后返回上一页
    setTimeout(() => {
      router.back();
    }, 500);
  } catch (error) {
    console.error('Submit error:', error);
    message.error((isEdit.value ? '修改' : '录入') + '失败: ' + error.message);
  } finally {
    submitting.value = false;
  }
};

const handleBack = () => {
  router.back();
};

const resetForm = () => {
  formState.student_id = undefined;
  formState.paper_name = '';
  formState.paper_year = new Date().getFullYear();
  formState.grade_type = '1';
  formState.score_details = { section_a: 0, section_b: 0, section_c: 0 };
  formState.comments = '';
};

// AI 助手功能
const showAIModal = () => {
  aiModalVisible.value = true;
  parseError.value = '';
};

const parseWithAI = async () => {
  if (!naturalLanguageInput.value.trim()) {
    message.warning('请输入成绩信息');
    return;
  }
  
  parsing.value = true;
  parseError.value = '';
  
  try {
    const res = await gradeApi.parseNaturalLanguage(naturalLanguageInput.value);
    
    if (!res.data.success) {
      parseError.value = res.data.error || '解析失败';
      return;
    }
    
    const parsed = res.data.data;
    
    // 回填表单
    if (parsed.student_id) {
      formState.student_id = parsed.student_id;
    } else if (parsed.student_name) {
      // 未匹配到学生，提示用户
      message.warning(`未找到学生 "${parsed.student_name}"，请手动选择`);
      formState.student_id = undefined;
    }
    
    if (parsed.paper_name) formState.paper_name = parsed.paper_name;
    if (parsed.paper_year) formState.paper_year = parsed.paper_year;
    if (parsed.grade_type) formState.grade_type = parsed.grade_type;
    if (parsed.score_details) formState.score_details = parsed.score_details;
    if (parsed.comments) formState.comments = parsed.comments;
    
    message.success('AI 解析成功，已回填表单');
    aiModalVisible.value = false;
    naturalLanguageInput.value = '';
    
  } catch (error) {
    parseError.value = '解析失败: ' + error.message;
  } finally {
    parsing.value = false;
  }
};

onMounted(() => {
  fetchAllStudents();
  if (isEdit.value) {
    fetchGradeDetail();
  }
});
</script>
