<template>
  <el-dialog
    v-model="dialogVisible"
    title="修改个人信息"
    width="60%"
    :before-close="handleClose"
    top="8vh"
    class="update-info-dialog"
  >
    <el-scrollbar max-height="65vh">
      <div class="form-container">
        <el-tabs v-model="activeTab" tab-position="left" class="info-tabs">
          
          <!-- 基础信息 -->
          <el-tab-pane label="基础信息" name="basic">
            <div class="tab-content">
              <h3>基础信息</h3>
              <p>管理您的基本个人资料。</p>
              <div class="info-list">
                <EditableItem field="realName" label="真实姓名" v-model="editableInfo.realName" :is-editing="isEditing" @edit="startEditing" />
                <EditableItem field="nickname" label="昵称" v-model="editableInfo.nickname" :is-editing="isEditing" @edit="startEditing" />
                <EditableItem field="gender" label="性别" v-model="editableInfo.gender" type="gender" :is-editing="isEditing" @edit="startEditing" />
                <EditableItem field="birthday" label="生日" v-model="editableInfo.birthday" type="date" :is-editing="isEditing" @edit="startEditing" />
                <EditableItem field="idCard" label="身份证号" v-model="editableInfo.idCard" :is-editing="isEditing" @edit="startEditing" />
                <EditableItem field="bio" label="个人简介" v-model="editableInfo.bio" type="textarea" :is-editing="isEditing" @edit="startEditing" />
              </div>
            </div>
          </el-tab-pane>

          <!-- 联系方式 -->
          <el-tab-pane label="联系方式" name="contact">
            <div class="tab-content">
              <h3>联系方式</h3>
              <p>管理您的联系信息，以便我们能及时与您沟通。</p>
              <div class="info-list">
                <EditableItem field="email" label="邮箱" v-model="editableInfo.email" :is-editing="isEditing" @edit="startEditing" />
                <EditableItem field="phone" label="手机号" v-model="editableInfo.phone" :is-editing="isEditing" @edit="startEditing" />
              </div>
            </div>
          </el-tab-pane>

          <!-- 学籍信息 -->
          <el-tab-pane label="学籍信息" name="academic">
             <div class="tab-content">
              <h3>学籍信息</h3>
              <p>您的学籍档案，部分关键信息可能需要联系管理员修改。</p>
              <div class="info-list">
                <EditableItem field="school" label="学校" v-model="editableInfo.school" :is-editing="isEditing" @edit="startEditing" />
                <EditableItem field="college" label="学院" v-model="editableInfo.college" :is-editing="isEditing" @edit="startEditing" />
                <EditableItem field="grade" label="年级" v-model="editableInfo.grade" :is-editing="isEditing" @edit="startEditing" />
                <EditableItem field="major" label="专业" v-model="editableInfo.major" :is-editing="isEditing" @edit="startEditing" />
                <EditableItem field="className" label="班级" v-model="editableInfo.className" :is-editing="isEditing" @edit="startEditing" />
                <EditableItem field="enrollmentDate" label="入学日期" v-model="editableInfo.enrollmentDate" type="date" :is-editing="isEditing" @edit="startEditing" />
                <EditableItem field="graduationDate" label="毕业日期" v-model="editableInfo.graduationDate" type="date" :is-editing="isEditing" @edit="startEditing" />
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
import { ref, watch, reactive, defineAsyncComponent } from 'vue';
import { useStudentInfoStore } from '../../store/studentInfoStore';
import { ElMessage } from 'element-plus';
import _ from 'lodash';

// 异步加载子组件
const EditableItem = defineAsyncComponent(() =>
  import('./EditableItem.vue')
);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible']);

const store = useStudentInfoStore();
const dialogVisible = ref(props.visible);
const activeTab = ref('basic');

const editableInfo = reactive({});
const isEditing = ref(null);

watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
  if (newVal) {
    // 使用 lodash 的深拷贝，确保数据隔离
    Object.assign(editableInfo, _.cloneDeep(store.userInfo));
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

const handleSave = () => {
  // 在这里可以调用API将 editableInfo 发送到后端
  console.log('保存的信息:', editableInfo);
  
  // 更新 Pinia store
  store.saveStudentInfo(editableInfo);

  ElMessage.success('信息更新成功！');
  isEditing.value = null;
  handleClose();
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

.info-list {
  display: flex;
  flex-direction: column;
}
</style>
