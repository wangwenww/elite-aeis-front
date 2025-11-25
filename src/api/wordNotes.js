/**
 * 单词笔记 API 服务
 * 封装单词笔记相关的 API 调用
 */
import http from './http.js';

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
 * 查询识别进度
 * @param {string} taskId - 任务ID
 * @returns {Promise} 进度信息
 */
export async function getProgress(taskId) {
  const response = await http.get(`/api/word-notes/progress/${taskId}`);
  return response.data;
}

/**
 * 获取识别任务列表
 * @param {Object} params - 查询参数
 */
export async function listJobs(params = {}) {
  const response = await http.get('/api/word-notes/jobs', { params });
  return response.data;
}

/**
 * 获取识别任务详情
 * @param {string} taskId - 任务ID
 */
export async function getJobDetail(taskId) {
  const response = await http.get(`/api/word-notes/jobs/${taskId}`);
  return response.data;
}

/**
 * 获取详情查看页面数据（包含所有页面和markdown内容）
 * @param {string} taskId - 任务ID
 */
export async function getDetailViewData(taskId) {
  const response = await http.get(`/api/word-notes/jobs/${taskId}/detail-view`);
  return response.data;
}

