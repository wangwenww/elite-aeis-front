<template>
  <a-drawer
    v-model:open="visible"
    :width="width"
    :title="title"
    :destroy-on-close="destroyOnClose"
    @close="handleClose"
  >
    <template v-if="record">
      <a-descriptions :bordered="bordered" :column="column">
        <a-descriptions-item
          v-for="field in fields"
          :key="field.key"
          :label="field.label"
          :span="field.span || 1"
        >
          <template v-if="field.render">
            {{ field.render(record[field.key]) }}
          </template>
          <template v-else>
            {{ record[field.key] ?? '-' }}
          </template>
        </a-descriptions-item>
      </a-descriptions>
    </template>
    <template v-else>
      <a-empty description="暂无详情信息" />
    </template>
    
    <slot name="extra" :record="record"></slot>
  </a-drawer>
</template>

<script setup>
/**
 * Reusable detail drawer component
 * @param {boolean} visible - Whether the drawer is visible
 * @param {Object} record - The record to display
 * @param {string} title - The title of the drawer
 * @param {number} width - Width of the drawer
 * @param {boolean} destroyOnClose - Whether to destroy on close
 * @param {boolean} bordered - Whether descriptions have borders
 * @param {number} column - Number of columns in descriptions
 * @param {Array} fields - Array of field configurations
 */

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  record: {
    type: Object,
    default: null
  },
  title: {
    type: String,
    default: '详情'
  },
  width: {
    type: Number,
    default: 720
  },
  destroyOnClose: {
    type: Boolean,
    default: true
  },
  bordered: {
    type: Boolean,
    default: true
  },
  column: {
    type: Number,
    default: 2
  },
  fields: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['close']);

const handleClose = () => {
  emit('close');
};
</script>