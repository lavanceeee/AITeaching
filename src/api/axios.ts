import axios from 'axios';
import { BASE_URL } from './config'
import { ElMessage, ElMessageBox } from 'element-plus';
import router from '../router';
import { useStudentInfoStore } from '../store/studentInfoStore';

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
  studentNumber: string;
  password: string;
  rememberMe: boolean;
}

//注册参数
interface RegisterParams {
  identity: string; //身份标识
  formData: any;
}

//登录
export const login_method = async (params: LoginParams)=>{
    try{
        console.log(params);
        const response = await apiClient.post(`${params.identity}/login`, params);
        
        if (response.data.code == 200) {
            ElMessage.success(response.data.message + '即将跳转至主页！')

      //localStorage
      //有问题
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('identity', params.identity)
      localStorage.setItem('id', response.data.data.id)

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
export const register_method = async (params: RegisterParams)=>{
    try{
        const response = await apiClient.post(`${params.identity}/register`, params.formData);
        if (response.data.code == 200){
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
        else{
            ElMessage.error(response.data.message)
        }
    }catch(error){
        ElMessage.error(`注册失败，${error}`);
        throw error;
    }
}

//获取学生的信息: 使用学号
export const getStudentInfo_method = async ()=> {
    try{
        const identity = localStorage.getItem('identity')
        const studentID = localStorage.getItem('id')
        //根据ID获取详细信息
        const response = await apiClient.post(`${identity}/${studentID}`)

    if (response.data.code == 200) {
      //拿到了用户的所有的信息，保存在pinia
      const userInfo = response.data.data
      const store = useStudentInfoStore();
      store.saveStudentInfo(userInfo)
    }
    else {
      const store = useStudentInfoStore();
      store.clearStudentInfo();
    }

  } catch (error) {
    const store = useStudentInfoStore();
    store.clearStudentInfo();
    ElMessage.error(`获取学生信息失败，${error}`);
    throw error;
  }
}

//更新学生信息
export const updateStudentInfo_method = async (updatedFields: Record<string, any>) => {
  try {
    const identity = localStorage.getItem('identity');

    const store = useStudentInfoStore();
    if (store.userInfo) {

      //使用put请求，只发送更新过的字段
      const response = await apiClient.put(`${identity}/update/${store.userInfo.studentNumber}`, updatedFields);

      if (response.data.code == 200) {
        ElMessage.success(response.data.message);
        // 更新成功后，同步更新 Pinia 中的状态
        const newInfo = { ...store.userInfo, ...updatedFields };
        store.saveStudentInfo(newInfo);
      }
      else {
        ElMessage.error(response.data.message);
      }
    }
    else {
      ElMessage.error('用户信息不存在');
    }
  } catch (error) {
    ElMessage.error(`更新学生信息失败，${error}`);
    throw error;
  }
}