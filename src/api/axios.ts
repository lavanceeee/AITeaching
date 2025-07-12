import axios from 'axios';
import { BASE_URL } from './config'
import { ElMessage } from 'element-plus';
import router from '../router';


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
    phone: string;
    email: string;
    password: string;
    confirmPassword: string;
    
    school: string;
    major: string;
    className: string;
    studentNumber: string;
}

//登录
export const login_method = async (params: LoginParams)=>{
    try{
        console.log(params);
        const response = await apiClient.post(`api/${params.identity}/login`, params);
        
        if (response.data.code == 200) {
            ElMessage.success(response.data.message + '即将跳转至主页！')

            //localStorage
            //有问题
            localStorage.setItem('token', response.data.token)
            localStorage.setItem('identity', params.identity)

            //跳转
            router.push(`/${params.identity}/dashboard`)
        }else {
            ElMessage.error(response.data.message)
        }
    }catch(error){
        ElMessage.error(`登录出错！${error}`);
        throw error;
    }
}

//注册
export const register_method = async (params: RegisterParams)=>{
    try{
        const response = await apiClient.post(`api/${params.identity}/register`, params);
        if (response.data.code == 200){
            ElMessage.success(response.data.message)
        }
        else{
            ElMessage.error(response.data.message)
        }
    }catch(error){
        ElMessage.error(`注册失败，${error}`);
        throw error;
    }
}