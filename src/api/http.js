import axios from 'axios';
import { getRuntimeConfig } from '../config/runtimeConfig';
import { message } from 'ant-design-vue';

const { apiBaseUrl } = getRuntimeConfig();

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || apiBaseUrl || '/api',
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 可以在这里添加token到请求头
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    // 处理成功的响应
    return response;
  },
  (error) => {
    // 统一处理错误响应
    let errorMessage = '请求发生错误';

    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response;

      switch (status) {
        case 400:
          errorMessage = data.detail || data.message || '请求参数错误';
          break;
        case 401:
          errorMessage = '未授权，请重新登录';
          // 可能需要跳转到登录页
          break;
        case 403:
          errorMessage = '拒绝访问，权限不足';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误';
          break;
        default:
          errorMessage = data.detail || data.message || `请求失败 (${status})`;
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      errorMessage = '网络连接失败，请检查网络';
    } else {
      // 其他错误
      errorMessage = error.message || '未知错误';
    }

    // 使用 Ant Design 的 message 组件显示错误
    message.error(errorMessage);

    return Promise.reject(new Error(errorMessage));
  }
);

export default http;
