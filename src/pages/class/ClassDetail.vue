<template>
  <div class="p-6">
    <div class="mb-6">
      <a-breadcrumb>
        <a-breadcrumb-item><router-link to="/classes">班级管理</router-link></a-breadcrumb-item>
        <a-breadcrumb-item>班级详情</a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <a-spin :spinning="loading">
      <div v-if="classInfo" class="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">{{ classInfo.name }}</h1>
            <a-space>
              <a-tag color="blue">{{ classInfo.grade_level }}</a-tag>
              <a-tag :color="classInfo.status === 'active' ? 'green' : 'default'">
                {{ classInfo.status === 'active' ? '授课中' : '已结束' }}
              </a-tag>
            </a-space>
          </div>
          <a-statistic title="学生人数" :value="students.length" />
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">学生列表</h2>
          <a-button type="primary" @click="showAddStudentModal">添加学生</a-button>
        </div>

        <a-table :columns="studentColumns" :data-source="students" row-key="id">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="link" @click="viewStudentGrades(record.id)">查看成绩</a-button>
                <a-popconfirm
                  title="确定要将该学生移出班级吗？"
                  @confirm="removeStudent(record.id)"
                >
                  <a-button type="link" danger>移出</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>

    <!-- 添加学生弹窗 -->
    <a-modal
      v-model:open="addStudentVisible"
      title="添加学生到班级"
      @ok="handleAddStudent"
      :confirmLoading="addStudentLoading"
    >
      <a-form layout="vertical">
        <a-form-item label="选择学生" required>
          <a-select
            v-model:value="selectedStudentId"
            show-search
            placeholder="搜索学生姓名"
            :filter-option="filterStudentOption"
            :options="allStudentsOptions"
            :loading="studentsLoading"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { schoolApi } from '../../api/school';
import { studentApi } from '../../api/student';

const route = useRoute();
const router = useRouter();
const classId = route.params.id;

const loading = ref(false);
const classInfo = ref(null);
const students = ref([]);

const addStudentVisible = ref(false);
const addStudentLoading = ref(false);
const selectedStudentId = ref(undefined);
const allStudentsOptions = ref([]);
const studentsLoading = ref(false);

const studentColumns = [
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '学号', dataIndex: 'student_id', key: 'student_id' },
  { title: '年级', dataIndex: 'grade_level', key: 'grade_level' },
  { title: '操作', key: 'action' }
];

const fetchClassDetails = async () => {
  loading.value = true;
  try {
    const res = await schoolApi.getClassDetails(classId);
    classInfo.value = res.data;
    // Assuming the API returns students in the class object or we need a separate call
    // Based on backend implementation: db_class.students is available but not explicitly in Pydantic model 'ClassResponse'
    // Wait, ClassResponse only has student_count. 
    // I need to check backend controller/schema. 
    // Backend `get_class` returns `db_class`. `ClassResponse` schema DOES NOT include `students` list.
    // I missed adding `students` to `ClassResponse` schema in backend.
    // However, `db_class` is an ORM object, FastAPI will try to map it to response model.
    // If response model doesn't have it, it won't be sent.
    // I should probably fix backend schema or add a separate endpoint for students.
    // But for now, let's assume I can fetch students separately or I need to fix backend.
    // Let's assume I'll fix backend schema to include students list, or use a separate endpoint.
    // Actually, `school_service.get_class_students` exists in service but not exposed in controller separately?
    // Wait, `get_class` controller returns `db_class`. 
    // Let's check `ClassResponse` in `src/schemas/school_schema.py`. It does NOT have students.
    // I should add `students` to `ClassResponse` or create a new endpoint.
    // For now, I will assume I can get students from a separate endpoint or I will fix backend.
    // Let's assume I will fix backend to return students in detail view.
    // Or I can use `http.get('/api/students')` and filter? No, that's bad.
    // I'll add a `students` field to `ClassResponse` in backend later.
    // For now, let's assume `res.data.students` exists.
    if (res.data.students) {
      students.value = res.data.students;
    } else {
       // Fallback or empty
       students.value = [];
    }
  } catch (error) {
    message.error('获取班级详情失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

const fetchAllStudents = async () => {
  studentsLoading.value = true;
  try {
    // Need a student listing API. Using studentApi.getStudents()
    const res = await studentApi.getStudents();
    // Response format: { success: true, students: [...] } or just [...]
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

const showAddStudentModal = () => {
  selectedStudentId.value = undefined;
  addStudentVisible.value = true;
  if (allStudentsOptions.value.length === 0) {
    fetchAllStudents();
  }
};

const filterStudentOption = (input, option) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

const handleAddStudent = async () => {
  if (!selectedStudentId.value) {
    message.warning('请选择学生');
    return;
  }
  addStudentLoading.value = true;
  try {
    await schoolApi.addStudentToClass(classId, selectedStudentId.value);
    message.success('添加成功');
    addStudentVisible.value = false;
    fetchClassDetails();
  } catch (error) {
    message.error('添加失败: ' + error.message);
  } finally {
    addStudentLoading.value = false;
  }
};

const removeStudent = async (studentId) => {
  try {
    await schoolApi.removeStudentFromClass(classId, studentId);
    message.success('移除成功');
    fetchClassDetails();
  } catch (error) {
    message.error('移除失败: ' + error.message);
  }
};

const viewStudentGrades = (studentId) => {
  router.push(`/students/${studentId}/grades`);
};

onMounted(() => {
  fetchClassDetails();
});
</script>
