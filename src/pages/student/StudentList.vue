<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">学生管理</h1>
      <a-button type="primary" size="large" @click="showCreateModal" class="bg-blue-600 text-white hover:bg-blue-500 border-none">
        <template #icon><plus-outlined /></template>
        新建学生
      </a-button>
    </div>

    <a-table 
      :columns="columns" 
      :data-source="students" 
      :loading="loading"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'classes'">
          <span v-if="!record.classes || record.classes.length === 0" class="text-gray-400">未分班</span>
          <a-space v-else wrap>
            <a-tag 
              v-for="cls in record.classes" 
              :key="cls.id" 
              color="blue" 
              class="cursor-pointer hover:opacity-80"
              @click="viewClass(cls.id)"
            >
              {{ cls.name }}
            </a-tag>
          </a-space>
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="link" @click="viewGrades(record.id)">查看成绩</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 创建学生弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      title="新建学生"
      @ok="handleModalOk"
      :confirmLoading="modalLoading"
    >
      <a-form layout="vertical" :model="formState" ref="formRef">
        <a-form-item
          label="学生姓名"
          name="name"
          :rules="[{ required: true, message: '请输入学生姓名' }]"
        >
          <a-input v-model:value="formState.name" placeholder="请输入姓名" />
        </a-form-item>
        <a-form-item label="学号" name="student_id">
          <a-input v-model:value="formState.student_id" placeholder="请输入学号（选填）" />
        </a-form-item>
        <a-form-item label="年级" name="grade_level">
          <a-select v-model:value="formState.grade_level" placeholder="请选择年级">
            <a-select-option value="P3">P3</a-select-option>
            <a-select-option value="P4">P4</a-select-option>
            <a-select-option value="P5">P5</a-select-option>
            <a-select-option value="P6">P6</a-select-option>
            <a-select-option value="S1">S1</a-select-option>
            <a-select-option value="S2">S2</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { studentApi } from '../../api/student';

const router = useRouter();
const loading = ref(false);
const students = ref([]);
const modalVisible = ref(false);
const modalLoading = ref(false);
const formRef = ref(null);

const formState = reactive({
  name: '',
  student_id: '',
  grade_level: undefined
});

const columns = [
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '学号', dataIndex: 'student_id', key: 'student_id' },
  { title: '年级', dataIndex: 'grade_level', key: 'grade_level' },
  { title: '所在班级', key: 'classes' },
  { title: '操作', key: 'action', width: 150 }
];

const fetchStudents = async () => {
  loading.value = true;
  try {
    const res = await studentApi.getStudents();
    // Backend returns { success: true, students: [...] }
    students.value = res.data.students;
  } catch (error) {
    message.error('获取学生列表失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

const showCreateModal = () => {
  formState.name = '';
  formState.student_id = '';
  formState.grade_level = undefined;
  modalVisible.value = true;
};

const handleModalOk = async () => {
  try {
    await formRef.value.validate();
    modalLoading.value = true;
    await studentApi.createStudent(formState);
    message.success('创建成功');
    modalVisible.value = false;
    fetchStudents();
  } catch (error) {
    if (error.errorFields) return;
    message.error('创建失败: ' + error.message);
  } finally {
    modalLoading.value = false;
  }
};

const viewGrades = (id) => {
  router.push(`/students/${id}/grades`);
};

const viewClass = (id) => {
  router.push(`/classes/${id}`);
};

onMounted(() => {
  fetchStudents();
});
</script>
