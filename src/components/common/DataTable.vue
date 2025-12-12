<template>
  <a-card class="table-card" :title="title" :bordered="false">
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :row-key="rowKey"
      :pagination="false"
      :bordered="bordered"
      :size="size"
    >
      <template #bodyCell="{ column, record }">
        <slot name="bodyCell" :column="column" :record="record">
          <template v-if="column.key === 'actions'">
            <a-space>
              <slot name="actions" :record="record"></slot>
            </a-space>
          </template>
          <template v-else>
            {{ record[column.dataIndex] ?? '-' }}
          </template>
        </slot>
      </template>
    </a-table>

    <div class="table-footer">
      <a-pagination
        v-if="pagination"
        :current="pagination.current"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        :show-size-changer="pagination.showSizeChanger"
        @change="handlePageChange"
        @showSizeChange="handlePageChange"
      />
    </div>
  </a-card>
</template>

<script setup>
/**
 * Reusable table component with actions and pagination
 * @param {string} title - The title of the table card
 * @param {Array} columns - Table columns configuration
 * @param {Array} dataSource - Table data source
 * @param {boolean} loading - Whether the table is loading
 * @param {string} rowKey - The key for identifying rows
 * @param {boolean} bordered - Whether the table has borders
 * @param {string} size - Table size (default, middle, small)
 * @param {Object} pagination - Pagination configuration
 */

const props = defineProps({
  title: {
    type: String,
    default: '数据表格'
  },
  columns: {
    type: Array,
    required: true
  },
  dataSource: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  rowKey: {
    type: String,
    default: 'id'
  },
  bordered: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'middle'
  },
  pagination: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['pageChange']);

const handlePageChange = (page, pageSize) => {
  emit('pageChange', page, pageSize);
};
</script>

<style scoped>
.table-card {
  max-width: 1200px;
  margin: 0 auto 24px;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>