<template>
  <el-dialog
    :model-value="visible"
    title="创建新课程"
    width="55%"
    top="8vh"
    :before-close="handleClose"
    class="create-course-dialog"
  >
    <el-scrollbar max-height="70vh">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="course-form">
        <!-- Section 0: 课程封面上传 -->
        <div class="form-section">
          <h4 class="section-title">课程封面</h4>
          <el-form-item prop="cover">
             <el-upload
                class="cover-uploader"
                :action="`${uploadUrl}`"
                :headers="{ Authorization: `Bearer ${token}` }"
                :show-file-list="false"
                :on-success="handleCoverSuccess"
                :before-upload="beforeCoverUpload"
              >
                <img v-if="form.cover" :src="form.cover" class="cover-image" alt="Course Cover"/>
                <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
              </el-upload>
          </el-form-item>
        </div>

        <!-- Section 1: 核心信息 -->
        <div class="form-section">
          <h4 class="section-title">核心信息</h4>
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
          </el-row>
          <el-form-item label="课程描述" prop="description">
            <el-input v-model="form.description" type="textarea" :rows="3" placeholder="简要介绍课程内容、目标等" />
          </el-form-item>
        </div>

        <!-- Section 2: 归属信息 -->
        <div class="form-section">
          <h4 class="section-title">归属信息</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="所属学校" prop="school">
                <el-input v-model="form.school" placeholder="请输入所属学校" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="所属专业" prop="major">
                <el-input v-model="form.major" placeholder="请输入所属专业" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="所属年级" prop="grade">
                <el-input v-model="form.grade" placeholder="请输入所属年级" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- Section 3: 教学信息 -->
        <div class="form-section">
          <h4 class="section-title">教学信息</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="课程学分" prop="credits">
                <el-input-number v-model="form.credits" :min="0" :max="20" controls-position="right" style="width: 100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="课程学时" prop="hours">
                <el-input-number v-model="form.hours" :min="0" :step="8" controls-position="right" style="width: 100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="课程容量" prop="capacity">
                <el-input-number v-model="form.capacity" :min="1" controls-position="right" style="width: 100%;" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="课程标签" prop="tags">
            <el-input v-model="form.tags" placeholder="多个标签用英文逗号(,)分隔" />
          </el-form-item>
        </div>
        
        <!-- Section 4: 排课信息 -->
        <div class="form-section">
            <h4 class="section-title">排课信息</h4>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="课程开始时间" prop="startTime">
                        <el-date-picker v-model="form.startTime" type="date" placeholder="选择开始日期" style="width: 100%;" value-format="YYYY-MM-DD" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="课程结束时间" prop="endTime">
                        <el-date-picker v-model="form.endTime" type="date" placeholder="选择结束日期" style="width: 100%;" value-format="YYYY-MM-DD" />
                    </el-form-item>
                </el-col>
            </el-row>
        </div>
      </el-form>
    </el-scrollbar>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
          立即创建
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useTeacherInfoStore } from '../../store/teacherInfoStore';
import { createCourse_method } from '../../api/axios';
import { BASE_URL } from '../../api/config';
import defaultCover from '../../assets/images/projectPic/project02.jpg';

const props = defineProps({
  visible: Boolean,
});
const emit = defineEmits(['update:visible', 'created']);

const formRef = ref(null);
const isSubmitting = ref(false);
const teacherStore = useTeacherInfoStore();
const token = localStorage.getItem('token');
const uploadUrl = `${BASE_URL}/upload/image`;

const initialFormState = () => ({
  name: '',
  courseCode: '',
  description: '',
  cover: '',
  school: teacherStore.userInfo?.school || '某某大学',
  major: '计算机科学与技术',
  grade: '2024级',
  credits: 3,
  hours: 48,
  capacity: 50,
  tags: '',
  startTime: '',
  endTime: '',
  status: 0, // 默认为草稿状态
});

const form = reactive(initialFormState());

const rules = reactive({
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  courseCode: [{ required: true, message: '请输入课程代码', trigger: 'blur' }],
  school: [{ required: true, message: '请输入所属学校', trigger: 'blur' }],
  major: [{ required: true, message: '请输入所属专业', trigger: 'blur' }],
  grade: [{ required: true, message: '请输入所属年级', trigger: 'blur' }],
});

const handleCoverSuccess = (response, uploadFile) => {
  if (response.code === 200 && response.data.fileUrl) {
    try {
      const serverOrigin = new URL(BASE_URL).origin;
      form.cover = serverOrigin + response.data.fileUrl;
      ElMessage.success('封面上传成功!');
    } catch (error) {
       console.error("解析BASE_URL失败:", error);
       // 如果BASE_URL是相对路径，则直接拼接
       form.cover = response.data.fileUrl;
       ElMessage.success('封面上传成功! (请注意检查图片路径)');
    }
  } else {
    ElMessage.error(response.message || '封面上传失败');
  }
};

const beforeCoverUpload = (rawFile) => {
  const isJpgOrPng = rawFile.type === 'image/jpeg' || rawFile.type === 'image/png';
  const isLt2M = rawFile.size / 1024 / 1024 < 2;

  if (!isJpgOrPng) {
    ElMessage.error('封面图片只能是 JPG 或 PNG 格式!');
  }
  if (!isLt2M) {
    ElMessage.error('封面图片大小不能超过 2MB!');
  }
  return isJpgOrPng && isLt2M;
};


const resetForm = () => {
  Object.assign(form, initialFormState());
  formRef.value?.clearValidate();
};

const handleClose = () => {
  if (isSubmitting.value) return;
  emit('update:visible', false);
  resetForm();
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      let isSuccess = false;
      isSubmitting.value = true;
      try {
        const teacherInfo = teacherStore.userInfo;
        if (!teacherInfo || !teacherInfo.id) {
          ElMessage.error('无法获取教师信息，请重新登录。');
          return;
        }

        const courseData = {
          ...form,
          teacherId: teacherInfo.id,
          teacherName: teacherInfo.realName,
        };

        // 如果没有上传封面，则使用默认封面
        if (!courseData.cover) {
          courseData.cover = defaultCover;
        }
        
        const result = await createCourse_method(courseData);
        if (result.code === 200) {
          emit('created');
          isSuccess = true;
        }
      } catch (error) {
        console.error('创建课程时发生错误:', error);
      } finally {
        isSubmitting.value = false;
        if (isSuccess) {
          handleClose();
        }
      }
    } else {
      ElMessage.warning('请检查表单并填写所有必填项。');
    }
  });
};

watch(() => props.visible, (newVal) => {
    if(!newVal){
        resetForm();
    }
});
</script>

<style>
.create-course-dialog .el-dialog__body {
  padding: 10px 30px 20px 30px;
}
.create-course-dialog .el-form-item__label {
    margin-bottom: 4px;
    font-size: 14px;
    color: #333;
}
</style>

<style scoped>
.course-form {
  padding-right: 15px; /* for scrollbar */
}

.cover-uploader {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.cover-uploader :deep(.el-upload) {
  border: 1px dashed var(--el-border-color-darker);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.cover-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.el-icon.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 260px;
  height: 146px;
  text-align: center;
}

.cover-image {
  width: 260px;
  height: 146px;
  object-fit: cover;
  display: block;
}

.form-section {
  margin-bottom: 28px;
  padding: 20px;
  border-radius: 8px;
  background-color: #fcfcfc;
  border: 1px solid #f0f0f0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e5e5;
}

.dialog-footer {
  text-align: right;
}
</style>
