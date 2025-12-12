<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">班级管理</h1>
      <a-button type="primary" size="large" @click="showCreateModal" class="bg-blue-600 text-white hover:bg-blue-500 border-none">
        <template #icon><plus-outlined /></template>
        新建班级
      </a-button>
    </div>

    <a-table 
      :columns="columns" 
      :data-source="classes" 
      :loading="loading"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="link" @click="viewClass(record.id)">详情</a-button>
            <a-button type="link" @click="editClass(record)">编辑</a-button>
            <a-popconfirm
              title="确定要删除这个班级吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="deleteClass(record.id)"
            >
              <a-button type="link" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 创建/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      :confirmLoading="modalLoading"
    >
      <a-form layout="vertical" :model="formState" ref="formRef">
        <a-form-item
          label="班级名称"
          name="name"
          :rules="[{ required: true, message: '请输入班级名称' }]"
        >
          <a-input v-model:value="formState.name" placeholder="例如：202603-A01" />
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
        <a-form-item label="状态" name="status">
          <a-select v-model:value="formState.status">
            <a-select-option value="active">授课中</a-select-option>
            <a-select-option value="graduated">已毕业</a-select-option>
            <a-select-option value="finished">已结课</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { schoolApi } from '../../api/school';

const router = useRouter();
const loading = ref(false);
const classes = ref([]);
const modalVisible = ref(false);
const modalLoading = ref(false);
const modalTitle = ref('新建班级');
const isEditing = ref(false);
const currentId = ref(null);
const formRef = ref(null);

const formState = reactive({
  name: '',
  grade_level: undefined,
  status: 'active'
});

const columns = [
  { title: '班级名称', dataIndex: 'name', key: 'name' },
  { title: '年级', dataIndex: 'grade_level', key: 'grade_level' },
  { title: '学生人数', dataIndex: 'student_count', key: 'student_count' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '创建时间', dataIndex: 'created_at', key: 'created_at' },
  { title: '操作', key: 'action', width: 250 }
];

const getStatusColor = (status) => {
  const map = { active: 'green', graduated: 'blue', finished: 'default' };
  return map[status] || 'default';
};

const getStatusText = (status) => {
  const map = { active: '授课中', graduated: '已毕业', finished: '已结课' };
  return map[status] || status;
};

const fetchClasses = async () => {
  loading.value = true;
  try {
    const res = await schoolApi.getClasses();
    classes.value = res.data;
  } catch (error) {
    message.error('获取班级列表失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

const showCreateModal = async () => {
  console.log('Opening create modal');
  modalTitle.value = '新建班级';
  isEditing.value = false;
  currentId.value = null;
  
  // Reset form
  formState.name = '';
  formState.grade_level = undefined;
  formState.status = 'active';
  
  modalVisible.value = true;
  
  await nextTick();
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

const editClass = (record) => {
  modalTitle.value = '编辑班级';
  isEditing.value = true;
  currentId.value = record.id;
  formState.name = record.name;
  formState.grade_level = record.grade_level;
  formState.status = record.status;
  modalVisible.value = true;
};

const deleteClass = async (id) => {
  try {
    await schoolApi.deleteClass(id);
    message.success('删除成功');
    fetchClasses();
  } catch (error) {
    message.error('删除失败: ' + error.message);
  }
};

const handleModalOk = async () => {
  try {
    await formRef.value.validate();
    modalLoading.value = true;
    
    if (isEditing.value) {
      await schoolApi.updateClass(currentId.value, formState);
      message.success('更新成功');
    } else {
      await schoolApi.createClass(formState);
      message.success('创建成功');
    }
    
    modalVisible.value = false;
    fetchClasses();
  } catch (error) {
    if (error.errorFields) return; // Form validation error
    message.error((isEditing.value ? '更新' : '创建') + '失败: ' + error.message);
  } finally {
    modalLoading.value = false;
  }
};

const viewClass = (id) => {
  router.push(`/classes/${id}`);
};

onMounted(() => {
  fetchClasses();
});
</script>
