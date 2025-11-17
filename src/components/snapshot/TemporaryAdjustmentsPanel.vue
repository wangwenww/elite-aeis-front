<template>
  <a-card class="adjust-card surface-card" :bordered="false">
    <template #title>
      <div class="card-title">
        <div class="title-text">
          <span class="card-icon">🧾</span>
          <span>临时费用调整</span>
        </div>
        <a-button type="primary" size="small" @click="handleSubmit">添加调整</a-button>
      </div>
    </template>

  <a-form layout="inline" class="adjust-form">
      <a-form-item label="名称">
        <a-input v-model:value="form.name" placeholder="例如：补课费 / 折扣" allow-clear />
      </a-form-item>
      <a-form-item label="金额">
        <a-input-number
          v-model:value="form.amount"
          :precision="2"
          :step="10"
          :string-mode="false"
          placeholder="可正可负"
          style="width: 160px"
        />
      </a-form-item>
      <a-form-item label="币种">
        <a-select v-model:value="form.currency" style="width: 120px">
          <a-select-option value="CNY">CNY</a-select-option>
          <a-select-option value="SGD">SGD</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="日期">
        <a-date-picker v-model:value="form.date" value-format="YYYY-MM-DD" style="width: 160px" />
      </a-form-item>
      <a-form-item label="备注">
        <a-input v-model:value="form.notes" placeholder="可选" allow-clear />
      </a-form-item>
    </a-form>

    <div class="adjust-table">
      <a-table
        v-if="adjustments.length"
        :data-source="adjustments"
        :columns="columns"
        :pagination="false"
        size="small"
        :row-key="(record) => record.uid"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.key === 'amount'">
            {{ formatAmount(record.amount, record.currency) }}
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-button type="link" danger @click="emit('remove', record.uid)">移除</a-button>
          </template>
          <template v-else>
            {{ text }}
          </template>
        </template>
      </a-table>
      <a-empty v-else description="尚未添加临时调整" />
    </div>
  </a-card>
</template>

<script setup>
import { reactive } from 'vue';
import dayjs from 'dayjs';
import { message } from 'ant-design-vue';

const props = defineProps({
  adjustments: {
    type: Array,
    default: () => [],
  },
  formatAmount: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(['add', 'remove']);

const form = reactive({
  name: '',
  amount: null,
  currency: 'CNY',
  date: dayjs().format('YYYY-MM-DD'),
  notes: '',
});

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '日期', dataIndex: 'date', key: 'date' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  { title: '币种', dataIndex: 'currency', key: 'currency' },
  { title: '备注', dataIndex: 'notes', key: 'notes' },
  { title: '操作', key: 'actions' },
];

function handleSubmit() {
  if (form.amount === null || form.amount === '') {
    message.warning('请填写金额，可以为正数或负数');
    return;
  }
  emit('add', {
    ...form,
    amount: form.amount,
  });
  resetForm();
}

function resetForm() {
  form.name = '';
  form.amount = null;
  form.currency = 'CNY';
  form.date = dayjs().format('YYYY-MM-DD');
  form.notes = '';
}
</script>

<style scoped>
.adjust-card :deep(.ant-card-head) {
  background: transparent;
  border-bottom: 1px solid #e2e8f0;
  padding: 18px 24px;
}

.adjust-card :deep(.ant-card-body) {
  padding: 22px 24px 26px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #102a43;
}

.card-icon {
  font-size: 20px;
}

.adjust-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.adjust-table {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  background: #f8fafc;
}

.adjust-table :deep(.ant-table) {
  background: transparent;
}

.adjust-table :deep(.ant-empty-description) {
  color: #94a3b8;
}

@media (max-width: 768px) {
  .adjust-card :deep(.ant-card-body) {
    padding: 20px;
  }

  .adjust-form {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

