<template>
  <el-dialog v-model="dialogVisible" title="修改个人信息" width="60%" :before-close="handleClose" top="8vh"
    class="update-info-dialog">
    <el-scrollbar max-height="65vh">
      <div class="form-container">
        <el-tabs v-model="activeTab" tab-position="left" class="info-tabs">

          <!-- 基础信息 -->
          <el-tab-pane label="基础信息" name="basic">
            <div class="tab-content">
              <h3>基础信息</h3>
              <p>管理您的基本个人资料。</p>

              <!-- Avatar Upload -->
              <div class="avatar-container">
                <el-upload class="avatar-uploader" :action="uploadAction" :show-file-list="false"
                  :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" :headers="{
                    'Authorization': 'Bearer ' + token
                  }">
                  <el-avatar :size="80" :src="editableInfo.avatar" />
                  <div class="avatar-uploader-overlay">
                    <el-icon class="avatar-uploader-icon">
                      <Plus />
                    </el-icon>
                  </div>
                </el-upload>
              </div>

              <div class="info-list">
                <EditableItem field="realName" label="真实姓名" v-model="editableInfo.realName" :is-editing="isEditing"
                  @edit="startEditing" />
                
                <!-- 学生特有字段 -->
                <template v-if="isStudent">
                  <EditableItem field="nickname" label="昵称" v-model="editableInfo.nickname" :is-editing="isEditing"
                    @edit="startEditing" />
                  <EditableItem field="gender" label="性别" v-model="editableInfo.gender" type="gender"
                    :is-editing="isEditing" @edit="startEditing" />
                  <EditableItem field="birthday" label="生日" v-model="editableInfo.birthday" type="date"
                    :is-editing="isEditing" @edit="startEditing" />
                  <EditableItem field="bio" label="个人简介" v-model="editableInfo.bio" type="textarea"
                    :is-editing="isEditing" @edit="startEditing" />
                </template>

                <EditableItem field="idCard" label="身份证号" v-model="editableInfo.idCard" :is-editing="isEditing"
                  @edit="startEditing" />
                
                <!-- 教师特有字段 -->
                <template v-if="isTeacher">
                  <EditableItem field="username" label="用户名" v-model="editableInfo.username" :is-editing="isEditing"
                    @edit="startEditing" />
                </template>
              </div>
            </div>
          </el-tab-pane>

          <!-- 联系方式 -->
          <el-tab-pane label="联系方式" name="contact">
            <div class="tab-content">
              <h3>联系方式</h3>
              <p>管理您的联系信息，以便我们能及时与您沟通。</p>
              <div class="info-list">
                <EditableItem field="email" label="邮箱" v-model="editableInfo.email" :is-editing="isEditing"
                  @edit="startEditing" />
                <EditableItem field="phone" label="手机号" v-model="editableInfo.phone" :is-editing="isEditing"
                  @edit="startEditing" />
              </div>
            </div>
          </el-tab-pane>

          <!-- 学籍信息 - 仅学生可见 -->
          <el-tab-pane v-if="isStudent" label="学籍信息" name="academic">
            <div class="tab-content">
              <h3>学籍信息</h3>
              <p>您的学籍档案，部分关键信息可能需要联系管理员修改。</p>
              <div class="info-list">
                <EditableItem field="school" label="学校" v-model="editableInfo.school" :is-editing="isEditing"
                  @edit="startEditing" />
                <EditableItem field="college" label="学院" v-model="editableInfo.college" :is-editing="isEditing"
                  @edit="startEditing" />
                <EditableItem field="grade" label="年级" v-model="editableInfo.grade" :is-editing="isEditing"
                  @edit="startEditing" />
                <EditableItem field="major" label="专业" v-model="editableInfo.major" :is-editing="isEditing"
                  @edit="startEditing" />
                <EditableItem field="className" label="班级" v-model="editableInfo.className" :is-editing="isEditing"
                  @edit="startEditing" />
                <EditableItem field="enrollmentDate" label="入学日期" v-model="editableInfo.enrollmentDate" type="date"
                  :is-editing="isEditing" @edit="startEditing" />
                <EditableItem field="graduationDate" label="毕业日期" v-model="editableInfo.graduationDate" type="date"
                  :is-editing="isEditing" @edit="startEditing" />
              </div>
            </div>
          </el-tab-pane>

          <!-- 教师信息 - 仅教师可见 -->
          <el-tab-pane v-if="isTeacher" label="教师信息" name="teacher">
            <div class="tab-content">
              <h3>教师信息</h3>
              <p>您的教师信息，部分信息可能需要联系管理员修改。</p>
              <div class="info-list">
                <EditableItem field="school" label="学校" v-model="editableInfo.school" :is-editing="isEditing"
                  @edit="startEditing" />
                <EditableItem field="teacherNumber" label="教师工号" v-model="editableInfo.teacherNumber" :is-editing="isEditing"
                  @edit="startEditing" disabled />
              </div>
            </div>
          </el-tab-pane>

        </el-tabs>
      </div>
    </el-scrollbar>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleSave">保 存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, reactive, defineAsyncComponent, computed } from 'vue';
import { useStudentInfoStore } from '../../store/studentInfoStore';
import { useTeacherInfoStore } from '../../store/teacherInfoStore';
import { ElMessage } from 'element-plus';
import _ from 'lodash';
import { updateUserInfo_method } from '../../api/axios';
import { Plus } from '@element-plus/icons-vue';
import { BASE_URL, Image_URL } from '../../api/config'

//el-upload的action定义
const uploadAction = BASE_URL + '/upload/image';

// 异步加载子组件
const EditableItem = defineAsyncComponent(() =>
  import('./EditableItem.vue')
);

let token = ref(localStorage.getItem('token'));

// 根据身份选择对应的 store
const identity = localStorage.getItem('identity') || 'student';
const isStudent = computed(() => identity === 'student');
const isTeacher = computed(() => identity === 'teacher');

// 初始化 store
const studentStore = useStudentInfoStore();
const teacherStore = useTeacherInfoStore();

// 根据身份获取对应的store
const userStore = computed(() => {
  if (isStudent.value) {
    return studentStore;
  } else if (isTeacher.value) {
    return teacherStore;
  }
  return studentStore; // 默认使用学生store
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible']);

const dialogVisible = ref(props.visible);
const activeTab = ref('basic');

const editableInfo = reactive({});
const isEditing = ref(null);

watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
  if (newVal) {
    // 使用 lodash 的深拷贝，确保数据隔离
    Object.assign(editableInfo, _.cloneDeep(userStore.value.userInfo));
    if (!editableInfo.avatar) {
      // 提供一个默认头像，防止src为空
      editableInfo.avatar = "https://pic.616pic.com/ys_bnew_img/00/42/51/nLWA3fYywP.jpg";
    }
    isEditing.value = null; // 重置编辑状态
  }
});

const startEditing = (field) => {
  isEditing.value = field;
};

const handleClose = () => {
  emit('update:visible', false);
};

const handleCancel = () => {
  isEditing.value = null;
  handleClose();
};

const handleAvatarSuccess = (response, uploadFile) => {
  editableInfo.avatar = Image_URL + response.data.fileUrl;
  ElMessage.success('头像上传成功，点击保存后生效！');
};

const beforeAvatarUpload = (rawFile) => {
  //图片类型：JPG, JPEG, PNG, GIF, BMP, WEBP
  const isJpgOrPng = rawFile.type === 'image/jpeg' || rawFile.type === 'image/png' || rawFile.type === 'image/bmp' || rawFile.type === 'image/webp';
  //图片大小：10MB
  const isLt2M = rawFile.size / 1024 / 1024 < 10;

  if (!isJpgOrPng) {
    ElMessage.error('头像图片只能是 JPG/PNG/BMP/WEBP 格式');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 10MB');
    return false;
  }
  return isJpgOrPng && isLt2M;
};


//点击保存按钮
const handleSave = async () => {
  const originalUserInfo = userStore.value.userInfo;
  const changedFields = {};

  if (!originalUserInfo) {
    ElMessage.error('无法获取原始用户信息！');
    return;
  }

  // 遍历 editableInfo 的键，并与原始数据进行比较
  Object.keys(editableInfo).forEach(key => {
    // 使用 lodash 的 isEqual 进行深度比较，可以正确处理对象和数组等复杂情况
    if (!_.isEqual(editableInfo[key], originalUserInfo[key])) {
      changedFields[key] = editableInfo[key];
    }
  });

  // 如果没有字段被修改，则提示用户并关闭对话框
  if (Object.keys(changedFields).length === 0) {
    ElMessage.info('您没有修改任何信息。');
    isEditing.value = null;
    handleClose();
    return;
  }

  try {
    // 添加用户ID
    changedFields.id = originalUserInfo.id;
    // 使用通用的用户信息更新方法，会根据身份自动选择正确的接口
    await updateUserInfo_method(changedFields);
  } finally {
    // 无论请求成功与否，都重置编辑状态并关闭对话框
    isEditing.value = null;
    handleClose();
  }
};
</script>

<style>
.update-info-dialog .el-dialog__body {
  padding: 0;
}

.update-info-dialog .el-tabs__header {
  margin-right: 0;
}
</style>

<style scoped>
.form-container {
  padding: 20px 0 20px 20px;
}

.info-tabs {
  min-height: 400px;
}

.tab-content {
  padding: 0 20px;
}

.tab-content h3 {
  margin: 0 0 5px 0;
  font-size: 1.5rem;
  font-weight: 500;
}

.tab-content p {
  margin: 0 0 25px 0;
  font-size: 0.9rem;
  color: #888;
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.avatar-uploader {
  position: relative;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
}

.avatar-uploader .el-avatar {
  border: 2px solid #eef0f3;
  transition: filter 0.3s;
}

.avatar-uploader:hover .el-avatar {
  filter: brightness(0.7);
}

.avatar-uploader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-uploader:hover .avatar-uploader-overlay {
  opacity: 1;
}

.avatar-uploader-icon {
  color: white;
  font-size: 24px;
}

.info-list {
  display: flex;
  flex-direction: column;
}
</style>
