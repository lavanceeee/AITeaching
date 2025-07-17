import axios from 'axios';
import { BASE_URL } from './config'
import { ElMessage, ElMessageBox } from 'element-plus';
import router from '../router';
import { useStudentInfoStore } from '../store/studentInfoStore';
import { useTeacherInfoStore } from '../store/teacherInfoStore';
import { useAIChatStore } from '../store/AIChatStore';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器：添加token到请求头
apiClient.interceptors.request.use(
  config => {
    // 获取token
    const token = localStorage.getItem('token');

    // 判断是否是登录或注册请求
    const isAuthPath = config.url && (
      config.url.includes('/login') ||
      config.url.includes('/register')
    );

    // 如果有token且不是登录注册请求，则添加到请求头
    if (token && !isAuthPath) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理token过期
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      // token过期或无效
      if (error.response.status === 401) {
        ElMessage.error('登录已过期，请重新登录');
        localStorage.removeItem('token');
        localStorage.removeItem('identity');
        router.push('/login');
      }
    }
    return Promise.reject(error);
  }
);

//参数
//登录参数
interface LoginParams {
  identity: string; //身份标识
  [key: string]: string | boolean;
  password: string;
  rememberMe: boolean;
}

//注册参数
interface RegisterParams {
  identity: string; //身份标识
  formData: any;
}

//登录
export const login_method = async (params: LoginParams) => {
  try {
    console.log(params);
    const response = await apiClient.post(`${params.identity}/login`, params);

    if (response.data.code == 200) {
      ElMessage.success(response.data.message + '即将跳转至主页！')

      console.log(response)
      //localStorage
      //有问题
      localStorage.setItem('token', response.data.data.token)
      localStorage.setItem('identity', params.identity)
      localStorage.setItem('id', response.data.data[`${params.identity}`].id)

      //跳转
      router.push(`/${params.identity}/dashboard`)
    } else {
      ElMessage.error(response.data.message)
    }
  } catch (error) {
    ElMessage.error(`登录出错！${error}`);
    throw error;
  }
}

//注册
export const register_method = async (params: RegisterParams) => {
  try {
    const response = await apiClient.post(`${params.identity}/register`, params.formData);
    if (response.data.code == 200) {
      ElMessage.success(response.data.message)
      //弹出跳转Box
      ElMessageBox.alert('注册成功，即将跳转至登录页', '提示', {
        confirmButtonText: '确定',
        showCancelButton: false,
        type: 'success'
      }).then(() => {
        router.push('/login');
      });
    }
    else {
      ElMessage.error(response.data.message)
    }
  } catch (error) {
    ElMessage.error(`注册失败，${error}`);
    throw error;
  }
}

//验证手机号，邮箱，学号是否已经存在

//获取用户信息
export const getUserInfo_method = async () => {
  try {
    const identity = localStorage.getItem('identity')
    const userID = localStorage.getItem('id')

    if (!identity || !userID) {
      ElMessage.error('无法获取用户信息，请重新登录');
      throw new Error('Missing identity or user ID');
    }

    //根据ID获取详细信息
    const response = await apiClient.get(`${identity}/${userID}`)

    if (response.data.code == 200) {
      const userInfo = response.data.data

      if (identity === 'student') {
        const store = useStudentInfoStore();
        store.saveStudentInfo(userInfo);
      } else if (identity === 'teacher') {
        const store = useTeacherInfoStore();
        store.saveTeacherInfo(userInfo);

        console.log(userInfo);
      } else {
        ElMessage.warning(`未知的用户身份类型: ${identity}`);
      }
    }
    else {
      // 清除所有可能的用户信息
      if (identity === 'student') {
        const store = useStudentInfoStore();
        store.clearStudentInfo();
      } else if (identity === 'teacher') {
        const store = useTeacherInfoStore();
        store.clearTeacherInfo();
      }
    }

  } catch (error) {
    const identity = localStorage.getItem('identity');
    if (identity === 'student') {
      const store = useStudentInfoStore();
      store.clearStudentInfo();
    } else if (identity === 'teacher') {
      const store = useTeacherInfoStore();
      store.clearTeacherInfo();
    }

    ElMessage.error(`获取用户信息失败，${error}`);
    throw error;
  }
}

// 保留学生端旧方法名
export const getStudentInfo_method = getUserInfo_method;

//更新用户信息
export const updateUserInfo_method = async (updatedFields: Record<string, any>) => {
  try {
    const identity = localStorage.getItem('identity');

    if (!identity) {
      ElMessage.error('无法确定用户身份，请重新登录');
      throw new Error('Missing identity');
    }

    // 根据身份选择不同的store
    if (identity === 'student') {
      const store = useStudentInfoStore();
      if (store.userInfo) {
        //使用put请求，只发送更新过的字段
        const response = await apiClient.put(`${identity}/update`, updatedFields);

        if (response.data.code == 200) {
          ElMessage.success(response.data.message);
          // 更新成功后，同步更新 Pinia 中的状态
          const newInfo = { ...store.userInfo, ...updatedFields };
          store.saveStudentInfo(newInfo);

          // 刷新信息
          getUserInfo_method();
        } else {
          ElMessage.error(response.data.message);
        }
      } else {
        ElMessage.error('用户信息不存在');
      }
    } else if (identity === 'teacher') {
      const store = useTeacherInfoStore();
      if (store.userInfo) {
        //使用put请求，只发送更新过的字段
        const response = await apiClient.put(`${identity}/update`, updatedFields);

        if (response.data.code == 200) {
          ElMessage.success(response.data.message);
          // 更新成功后，同步更新 Pinia 中的状态
          const newInfo = { ...store.userInfo, ...updatedFields };
          store.saveTeacherInfo(newInfo);

          // 刷新信息
          getUserInfo_method();
        } else {
          ElMessage.error(response.data.message);
        }
      } else {
        ElMessage.error('用户信息不存在');
      }
    } else {
      ElMessage.error('不支持的用户身份类型');
      throw new Error(`Unsupported identity: ${identity}`);
    }
  } catch (error) {
    ElMessage.error(`更新用户信息失败，${error}`);
    throw error;
  }
}

// 保留旧方法名称以保持向后兼容性
export const updateStudentInfo_method = updateUserInfo_method;

//fetchAPI 返回事件流
export const streamChat_method = (params: { message: string, memoryId?: string }) => {
  const token = localStorage.getItem('token');

  const formData = new FormData();
  formData.append('message', params.message);
  // 后端要求 memoryId 为 0 或不传表示新对话
  formData.append('memoryId', params.memoryId || '0');

  return fetch(`${BASE_URL}/ai/common/chat`, {
    method: 'POST',
    headers: {
      // 注意：当使用 FormData 作为 body 时，绝不可以手动设置 Content-Type。
      // 浏览器会自动设置 Content-Type 为 'multipart/form-data' 并附加必要的 boundary。
      'Accept': 'text/event-stream',
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
};

/**
 * 创建一个新的AI会话
 * @param params 包含创建会话所需的所有参数
 */
export const createConversation_method = async (params: {
  title: string;
  memoryId: string;
  modelName: string;
  tags?: string[];
  enableRag?: boolean;
  courseId?: number | null;
}) => {
  // 这里使用axios实例，因为它处理JSON响应和错误拦截更方便
  return apiClient.post('ai/conversation/create', params);
};

//获取历史会话
export const getHistory_method = async (page = 1, pageSize = 10) => {
  try {
    const identity = localStorage.getItem('identity') || 'student';
    let userId;

    // 根据身份获取对应的 store 和用户 ID
    if (identity === 'student') {
      const store = useStudentInfoStore();
      userId = store.userInfo?.id;
    } else if (identity === 'teacher') {
      const store = useTeacherInfoStore();
      userId = store.userInfo?.id;
      console.log("得到history教师的id", userId);
    } else {
      userId = localStorage.getItem('id');
    }

    if (!userId) {
      userId = localStorage.getItem('id');
    }

    if (!userId) {
      ElMessage.error('无法获取用户ID，请重新登录');
      throw new Error('User ID not found');
    }

    const response = await apiClient.get(`ai/conversation/user/${userId}`, {
      params: {
        page,
        pageSize,
      }
    });

    console.log("得到history的response", response);
    console.log("得到history的response.data", response.data);
    console.log("得到history的response.data.code", response.data.code);

    if (response.data.code === 200) {
      console.log("获取到分页历史数据:", response.data.data);
      return response.data.data;
    } else {
      ElMessage.error(response.data.message);
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('获取历史会话失败')) {
      ElMessage.error(`获取历史会话失败: ${errorMessage}`);
    }
    throw error;
  }
}


export const batchCreateMessages_method = async (params: {
  conversationId: number;
  messages: Array<{
    messageType: number;
    content: string;
  }>
}) => {
  try {
    const response = await apiClient.post('/ai/message/batch-create', params);

    if (response.data.code === 200) {
      console.log("批量创建成功:", response.data.data);

    } else {
      ElMessage.error(response.data.message);
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ElMessage.error(`批量创建失败: ${errorMessage}`);
    throw error;
  }
}

export const getConversationMessages_method = async (conversationId: number) => {

  try {

    const response = await apiClient.get(`/ai/message/conversation/${conversationId}/ordered`);

    if (response.data.code === 200) {
      console.log("获取到会话历史:", response.data.data);
      return response.data.data;
    } else {
      ElMessage.error(response.data.message);
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ElMessage.error(`获取会话历史失败: ${errorMessage}`);
    throw error;
  }
}

// ==================== 课程管理接口 ====================

// 定义课程创建接口的参数类型
interface CreateCourseParams {
  courseCode: string;
  name: string;
  description?: string;
  cover?: string;
  school: string;
  major: string;
  grade: string;
  status: number;
  tags?: string;
  startTime?: string;
  endTime?: string;
  teacherId: number;
  teacherName: string;
  credits?: number;
  hours?: number;
  capacity?: number;
}

export const createCourse_method = async (courseData: CreateCourseParams) => {
  try {
    const response = await apiClient.post('/course/create', courseData);
    if (response.data.code === 200) {
      ElMessage.success('课程创建成功！');
      return response.data;
    } else {
      ElMessage.error(response.data.message || '创建课程失败');
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('创建课程失败')) {
      ElMessage.error(`创建课程失败: ${errorMessage}`);
    }
    throw error;
  }
};

/**
 * 1.2 查询教师的课程列表
 * @param params 包含 teacherId 和分页信息
 */
export const queryCourses_method = async (params: { teacherId: String; page?: number; pageSize?: number }) => {
  try {
    const response = await apiClient.post(`/course/query`, {
      teacherId: params.teacherId,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    });
    if (response.data.code === 200) {
      return response.data;
    } else {
      ElMessage.error(response.data.message || '获取课程列表失败');
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('获取课程列表失败')) {
      ElMessage.error(`获取课程列表失败: ${errorMessage}`);
    }
    throw error;
  }
};

// ==================== 班级管理接口 ====================

// 定义班级创建接口的参数类型
interface CreateClassParams {
  name: string;
  major: string;
  grade: string;
  school: string;
}

//班级注册
export const createClass_method = async (classData: CreateClassParams) => {
  try {
    const response = await apiClient.post('/class/create', classData);
    if (response.data.code === 200) {
      ElMessage.success('班级创建成功！');
      return response.data;
    } else {
      ElMessage.error(response.data.message || '创建班级失败');
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('创建班级失败')) {
      ElMessage.error(`创建班级失败: ${errorMessage}`);
    }
    throw error;
  }
};

// 学生申请加入班级
export const joinClass_method = async (classCode: string) => {
  try {
    const response = await apiClient.post('/studentClass/join', { classCode });
    if (response.data.code === 200) {
      ElMessage.success('申请已提交，等待审核！');
      return response.data;
    } else {
      ElMessage.error(response.data.message || '申请加入班级失败');
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('申请加入班级失败')) {
      ElMessage.error(`申请加入班级失败: ${errorMessage}`);
    }
    throw error;
  }
};

// 班级分页查询参数类型
export interface QueryClassParams {
  name?: string;
  major?: string;
  grade?: string;
  school?: string;
  status?: number;
  studentCount?: number;
  createBy?: number;
  sortBy?: string;
  sortDir?: string;
  pageNum?: number;
  pageSize?: number;
}

// 班级分页查询返回类型
export interface ClassRecord {
  id: string;
  name: string;
  major: string;
  grade: string;
  school: string;
  status: number;
  studentCount: number;
}

export interface QueryClassResult {
  records: ClassRecord[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// 分页查询班级列表
export const queryClasses_method = async (params: QueryClassParams) => {
  try {
    const response = await apiClient.post('/class/query', params);
    if (response.data.code === 200) {
      return response.data.data as QueryClassResult;
    } else {
      ElMessage.error(response.data.message || '获取班级列表失败');
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('获取班级列表失败')) {
      ElMessage.error(`获取班级列表失败: ${errorMessage}`);
    }
    throw error;
  }
};

