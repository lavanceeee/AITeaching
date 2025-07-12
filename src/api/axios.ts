import axios from 'axios';
import { BASE_URL } from './config'
import { ElMessage } from 'element-plus';
import router from '../router';


// 创建 axios 实例
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

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