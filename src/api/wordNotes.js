/**
 * 单词笔记 API 服务
 * 封装单词笔记相关的 API 调用
 */
import http from './http.js';
import { getRuntimeConfig } from '../config/runtimeConfig';

/**
 * 上传 PDF 并切片
 * @param {string} classId - 班级ID
 * @param {File} pdfFile - PDF 文件
 * @returns {Promise} 包含任务ID和图片URL列表
 */
export async function uploadPDF(classId, pdfFile) {
  const formData = new FormData();
  formData.append('classId', classId);
  formData.append('pdfFile', pdfFile);

  const response = await http.post('/api/word-notes/upload-pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    // 不设置超时，允许长时间处理（大模型接口可能需要较长时间）
  });

  return response.data;
}

/**
 * 提交标注数据并开始识别
 * @param {string} taskId - 任务ID
 * @param {string} classId - 班级ID
 * @param {Array} pageMeta - 页面元数据列表
 * @returns {Promise} 识别结果
 */
export async function startRecognition(taskId, classId, pageMeta) {
  const response = await http.post('/api/word-notes/start-recognition', {
    taskId,
    classId,
    pageMeta,
  });

  return response.data;
}

/**
 * 查询识别进度
 * @param {string} taskId - 任务ID
 * @returns {Promise} 进度信息
 */
export async function getProgress(taskId) {
  const response = await http.get(`/api/word-notes/progress/${taskId}`);
  return response.data;
}

/**
 * 获取页面图片 URL
 * @param {string} taskId - 任务ID
 * @param {number} pageIndex - 页面索引（从1开始）
 * @returns {string} 图片URL
 */
export function getPageImageUrl(taskId, pageIndex) {
  const { apiBaseUrl } = getRuntimeConfig();
  const rawBase = import.meta.env.VITE_API_BASE_URL || apiBaseUrl || '/api';
  const baseURL = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
  return `${baseURL}/api/word-notes/temp/${taskId}/page_${pageIndex}.jpg`;
}

