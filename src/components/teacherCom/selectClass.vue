<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="添加班级到课程"
    width="680px"
    :close-on-click-modal="false"
    @open="fetchClasses"
    top="10vh"
  >
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>
    <div v-else class="content-container">
      <div v-if="Object.keys(groupedClasses).length === 0">
        <el-empty description="您还没有创建任何班级" />
      </div>
      <div v-else v-for="(classes, major) in groupedClasses" :key="major" class="major-group">
        <div class="major-header">
          <span class="major-title">{{ major }}</span>
          <el-checkbox
            :indeterminate="isIndeterminate(major)"
            v-model="checkAll[major]"
            @change="handleCheckAllChange(major, $event)">
            全选
          </el-checkbox>
        </div>
        <el-checkbox-group v-model="selectedClasses" @change="handleCheckedClassesChange(major)">
          <div class="class-grid">
            <el-checkbox 
              v-for="clazz in classes" 
              :key="clazz.id" 
              :label="clazz.id" 
              :disabled="isClassAssociated(clazz.id)"
              border 
              class="class-checkbox"
            >
              {{ clazz.name }}
              <el-tag v-if="isClassAssociated(clazz.id)" size="small" type="info" style="margin-left: 8px;">已添加</el-tag>
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">取 消</el-button>
        <el-button type="primary" @click="handleConfirm">
          确定添加 ({{ selectedClasses.length }} 个班级)
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { queryClasses_method } from '../../api/axios';
import { useTeacherInfoStore } from '../../store/teacherInfoStore';
import { ElMessage } from 'element-plus';

const props = defineProps({
  modelValue: Boolean,
  associatedClassIds: {
    type: Array,
    default: () => []
  }
});
const emit = defineEmits(['update:modelValue', 'confirm']);

const loading = ref(true);
const classList = ref([]);
const selectedClasses = ref([]);
const checkAll = reactive({});
const indeterminateStatus = reactive({});
const teacherStore = useTeacherInfoStore();

const groupedClasses = computed(() => {
  const groups = {};
  if (!classList.value) return groups;
  classList.value.forEach(clazz => {
    if (!groups[clazz.major]) {
      groups[clazz.major] = [];
    }
    groups[clazz.major].push(clazz);
  });
  return groups;
});

const isClassAssociated = (classId) => {
  return props.associatedClassIds.includes(classId);
};

const isIndeterminate = (major) => {
    return indeterminateStatus[major] || false;
};

const fetchClasses = async () => {
  loading.value = true;
  try {
    const teacherId = teacherStore.userInfo?.id || localStorage.getItem('id');
    if (!teacherId) {
      ElMessage.error('无法获取教师信息，请重新登录');
      return;
    }
    // 获取该教师的所有班级
    const data = await queryClasses_method({ teacherId, pageSize: 999 });
    classList.value = data.records;

    // 初始化全选框状态
    for (const major in groupedClasses.value) {
      checkAll[major] = false;
      indeterminateStatus[major] = false;
    }

  } catch (error) {
    console.error('获取班级列表失败:', error);
    ElMessage.error('获取班级列表失败');
    classList.value = [];
  } finally {
    loading.value = false;
  }
};

const handleCheckAllChange = (major, val) => {
  const classIdsInMajor = groupedClasses.value[major]
    .filter(c => !isClassAssociated(c.id)) // 过滤掉已关联的
    .map(c => c.id);
  if (val) {
    selectedClasses.value = [...new Set([...selectedClasses.value, ...classIdsInMajor])];
  } else {
    selectedClasses.value = selectedClasses.value.filter(id => !classIdsInMajor.includes(id));
  }
  indeterminateStatus[major] = false;
};

const handleCheckedClassesChange = (major) => {
  if (!groupedClasses.value[major]) return;
  const unassociatedClassIdsInMajor = groupedClasses.value[major]
    .filter(c => !isClassAssociated(c.id))
    .map(c => c.id);
  
  const selectedCountInMajor = unassociatedClassIdsInMajor.filter(id => selectedClasses.value.includes(id)).length;
  
  checkAll[major] = unassociatedClassIdsInMajor.length > 0 && selectedCountInMajor === unassociatedClassIdsInMajor.length;
  indeterminateStatus[major] = selectedCountInMajor > 0 && selectedCountInMajor < unassociatedClassIdsInMajor.length;
};

const handleConfirm = () => {
  const newSelections = selectedClasses.value.filter(id => !isClassAssociated(id));
  if (newSelections.length === 0) {
    ElMessage.info('您没有选择任何新的班级。');
    return;
  }
  emit('confirm', newSelections);
  emit('update:modelValue', false);
};

// 监听 selectedClasses 的变化，以同步各专业全选框的状态
watch(selectedClasses, () => {
    for (const major in groupedClasses.value) {
        handleCheckedClassesChange(major);
    }
}, { deep: true });

</script>

<style scoped>
.loading-container {
  padding: 20px;
}
.content-container {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 10px;
}
.major-group {
  margin-bottom: 24px;
}
.major-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 8px 8px 8px;
  border-bottom: 1px solid #f0f2f5;
}
.major-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}
.class-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 12px;
  padding: 0 5px;
}
.class-checkbox.el-checkbox.is-bordered {
  padding: 8px 12px;
  width: 100%;
  margin-right: 0;
}
</style>
