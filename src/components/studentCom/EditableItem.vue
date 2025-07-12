<template>
  <div class="editable-item" @click="handleClick" :class="{ 'is-editing': editingActive }">
    <div class="item-label">{{ label }}</div>
    <div class="item-value">
      <transition name="value-fade" mode="out-in">
        <!-- Display Mode -->
        <div v-if="!editingActive" class="value-display">
          <span>{{ displayValue || '点击编辑' }}</span>
          <el-icon class="edit-icon"><EditPen /></el-icon>
        </div>
        
        <!-- Edit Mode -->
        <div v-else class="value-edit" @click.stop>
          <el-input
            v-if="type === 'text'"
            v-model="internalValue"
            ref="inputRef"
            size="small"
            @blur="emit('edit', null)"
          />
          <el-input
            v-if="type === 'textarea'"
            v-model="internalValue"
            ref="inputRef"
            type="textarea"
            :rows="3"
            size="small"
            @blur="emit('edit', null)"
          />
          <el-select
            v-if="type === 'gender'"
            v-model="internalValue"
            ref="inputRef"
            size="small"
            placeholder="请选择"
            @change="emit('edit', null)"
          >
            <el-option label="男" :value="1"></el-option>
            <el-option label="女" :value="2"></el-option>
          </el-select>
          <el-date-picker
            v-if="type === 'date'"
            v-model="internalValue"
            ref="inputRef"
            type="date"
            placeholder="选择日期"
            size="small"
            @change="emit('edit', null)"
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { EditPen } from '@element-plus/icons-vue';

const props = defineProps({
  field: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: [String, Number, Date],
  isEditing: String,
  type: {
    type: String,
    default: 'text' // text, textarea, date, gender
  }
});

const emit = defineEmits(['update:modelValue', 'edit']);

const internalValue = ref(props.modelValue);
const inputRef = ref(null);

watch(() => props.modelValue, (newVal) => {
  internalValue.value = newVal;
});

watch(internalValue, (newVal) => {
  emit('update:modelValue', newVal);
});

const editingActive = computed(() => props.isEditing === props.field);

const handleClick = () => {
  if (!editingActive.value) {
    emit('edit', props.field);
  }
};

const displayValue = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') {
    return null;
  }
  if (props.type === 'gender') {
    if (props.modelValue === 1) return '男';
    if (props.modelValue === 2) return '女';
    return '未知';
  }
  if (props.type === 'date' && props.modelValue) {
    try {
      return new Date(props.modelValue).toLocaleDateString();
    } catch (e) {
      return '无效日期';
    }
  }
  return props.modelValue;
});

// Auto-focus the input when it becomes active
watch(editingActive, async (isEditing) => {
  if (isEditing) {
    await nextTick();
    if (inputRef.value) {
        if (typeof inputRef.value.focus === 'function') {
            inputRef.value.focus();
        } else if (inputRef.value.$el) { 
            const input = inputRef.value.$el.querySelector('input, textarea');
            if(input) input.focus();
        }
    }
  }
});
</script>

<style scoped>
.editable-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 8px;
  border-bottom: 1px solid #eef0f3;
  cursor: pointer;
  transition: background-color 0.2s;
  min-height: 50px;
}

.editable-item:not(.is-editing):hover {
  background-color: #f5f7fa;
}

.item-label {
  font-weight: 500;
  color: #606266;
  width: 100px; /* Fixed width for label */
  flex-shrink: 0;
}

.item-value {
  flex-grow: 1;
  text-align: right;
  min-height: 24px; /* Ensure height consistency */
}

.value-display {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  color: #303133;
  font-size: 0.9rem;
  padding-right: 4px;
}

.edit-icon {
  visibility: hidden;
  opacity: 0;
  transition: all 0.2s ease-in-out;
  color: #c0c4cc;
}

.editable-item:not(.is-editing):hover .edit-icon {
  visibility: visible;
  opacity: 1;
  transform: scale(1.1);
}

.value-edit {
  display: flex;
  justify-content: flex-end;
}

.value-fade-enter-active,
.value-fade-leave-active {
  transition: opacity 0.15s ease;
}

.value-fade-enter-from,
.value-fade-leave-to {
  opacity: 0;
}
</style> 