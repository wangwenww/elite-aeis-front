<template>
  <a-card class="extra-card" :bordered="false">
    <template #title>
      <div class="card-title">
        <div class="card-title-text">
          <span class="card-icon">🧾</span>
          <span>额外费用</span>
        </div>
        <a-button type="primary" size="small" :disabled="addDisabled" @click="emit('add-expense')">
          <PlusOutlined />
          <span>添加费用</span>
        </a-button>
      </div>
    </template>

    <a-table
      v-if="extraExpenses.length"
      class="extra-table"
      :columns="columns"
      :data-source="extraExpenses"
      :pagination="false"
      size="small"
      rowKey="record => record.uid"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'amount'">
          {{ formatAmount(record.amount, record.currency) }}
        </template>
        <template v-else-if="column.key === 'currency'">
          {{ record.currency || 'CNY' }}
        </template>
        <template v-else-if="column.key === 'actions'">
          <div class="action-group">
            <a-button type="link" size="small" @click="emit('edit-expense', record)">编辑</a-button>
            <a-popconfirm
              title="确定删除该费用吗？"
              ok-text="删除"
              cancel-text="取消"
              @confirm="() => emit('delete-expense', record.uid)"
            >
              <a-button type="link" size="small" danger>删除</a-button>
            </a-popconfirm>
          </div>
        </template>
        <template v-else>
          {{ record[column.dataIndex] ?? '—' }}
        </template>
      </template>
    </a-table>

    <div v-else class="empty-state">
      <span class="empty-icon">📭</span>
      <span>暂无额外费用</span>
    </div>
  </a-card>
</template>

<script setup>
import { PlusOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  extraExpenses: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    default: () => [],
  },
  formatAmount: {
    type: Function,
    required: true,
  },
  addDisabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['add-expense', 'edit-expense', 'delete-expense']);
</script>

<style scoped>
.extra-card :deep(.ant-card-body) {
  padding: 22px;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.card-title-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.card-icon {
  font-size: 20px;
}

.extra-table :deep(.ant-table-thead > tr > th) {
  background: #f1f5f9;
  border: none;
  color: #475569;
  font-weight: 600;
}

.extra-table :deep(.ant-table-tbody > tr > td) {
  border: none;
  border-bottom: 1px solid rgba(148, 163, 184, 0.28);
  font-size: 14px;
}

.action-group {
  display: inline-flex;
  gap: 4px;
}

.empty-state {
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #94a3b8;
  padding: 16px;
}

.empty-icon {
  font-size: 20px;
  opacity: 0.6;
}
</style>
