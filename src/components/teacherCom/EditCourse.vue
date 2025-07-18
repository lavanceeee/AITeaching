<template>
  <el-dialog
    :model-value="modelValue"
    title="编辑课程信息"
    width="60%"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <el-form
      v-if="form"
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="top"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="课程名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入课程名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="课程代码" prop="courseCode">
            <el-input v-model="form.courseCode" placeholder="请输入课程代码" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="课程描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="请输入课程描述"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属学校" prop="school">
            <el-input v-model="form.school" placeholder="请输入所属学校" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属专业" prop="major">
            <el-input v-model="form.major" placeholder="请输入所属专业" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属年级" prop="grade">
            <el-input v-model="form.grade" placeholder="请输入所属年级" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
           <el-form-item label="课程状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择课程状态">
              <el-option label="草稿" :value="0"></el-option>
              <el-option label="已发布" :value="1"></el-option>
              <el-option label="进行中" :value="2"></el-option>
              <el-option label="已结束" :value="3"></el-option>
              <el-option label="已取消" :value="4"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
         <el-col :span="8">
          <el-form-item label="课程学分" prop="credits">
            <el-input-number v-model="form.credits" :min="0" :max="20" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="课程学时" prop="hours">
            <el-input-number v-model="form.hours" :min="0" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="课程容量" prop="capacity">
            <el-input-number v-model="form.capacity" :min="0" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="开课时间" prop="startTime">
            <el-date-picker v-model="form.startTime" type="date" placeholder="选择开课日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结课时间" prop="endTime">
            <el-date-picker v-model="form.endTime" type="date" placeholder="选择结课日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
           <el-form-item label="课程标签" prop="tags">
             <el-input v-model="form.tags" placeholder="多个标签用英文逗号隔开" />
           </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">取 消</el-button>
        <el-button type="primary" @click="handleUpdate" :loading="isSubmitting">
          更 新
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { updateCourse_method } from '../../api/axios';

const props = defineProps({
  modelValue: Boolean,
  courseData: {
    type: Object,
    default: () => ({})
  }
});
const emit = defineEmits(['update:modelValue', 'update-success']);

const formRef = ref(null);
const form = ref(null);
const originalForm = ref(null);
const isSubmitting = ref(false);

const rules = {
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  courseCode: [{ required: true, message: '请输入课程代码', trigger: 'blur' }],
  school: [{ required: true, message: '请输入所属学校', trigger: 'blur' }],
  major: [{ required: true, message: '请输入所属专业', trigger: 'blur' }],
  grade: [{ required: true, message: '请输入所属年级', trigger: 'blur' }],
  status: [{ required: true, message: '请选择课程状态', trigger: 'change' }],
};

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // Deep copy to avoid direct mutation
    form.value = JSON.parse(JSON.stringify(props.courseData));
    originalForm.value = JSON.parse(JSON.stringify(props.courseData));
  }
}, { immediate: true });

const handleClose = () => {
    form.value = null;
    originalForm.value = null;
    if (formRef.value) {
        formRef.value.clearValidate();
    }
};

const handleUpdate = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      isSubmitting.value = true;
      const changedData = {};
      for (const key in form.value) {
        if (form.value[key] !== originalForm.value[key]) {
          changedData[key] = form.value[key];
        }
      }

      if (Object.keys(changedData).length === 0) {
        ElMessage.info('您没有修改任何信息。');
        isSubmitting.value = false;
        emit('update:modelValue', false);
        return;
      }

      const payload = {
        id: props.courseData.id,
        ...changedData
      };
      
      try {
        await updateCourse_method(payload);
        emit('update-success');
        emit('update:modelValue', false);
      } catch (error) {
        console.error('更新课程失败:', error);
      } finally {
        isSubmitting.value = false;
      }
    } else {
      ElMessage.error('请检查表单项是否填写正确。');
    }
  });
};
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
.el-form-item {
    margin-bottom: 18px;
}
.el-select, .el-date-picker {
    width: 100%;
}
</style> 