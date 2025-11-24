/**
 * 单词笔记处理 Composable
 * 管理页面状态（图片列表、标注数据、识别进度等）
 */
import { ref, reactive, computed } from 'vue';
import dayjs from 'dayjs';
import * as wordNotesAPI from '../api/wordNotes.js';

export function useWordNotes() {
  // 状态管理
  const currentStep = ref('upload'); // upload, annotate, processing, result
  const classId = ref('');
  const taskId = ref('');
  const totalPages = ref(0);
  const pages = ref([]);
  
  // 标注数据
  const pageMeta = reactive({}); // { pageIndex: { date, session } }
  
  // 识别进度
  const recognitionProgress = ref(0);
  const recognitionStatus = ref('idle'); // idle, processing, completed, failed
  
  // 处理结果
  const result = ref(null);
  
  // 错误信息
  const error = ref(null);
  
  // 加载状态
  const uploading = ref(false);
  const recognizing = ref(false);
  
  // 计算属性
  const annotatedCount = computed(() => {
    return Object.keys(pageMeta).length;
  });
  
  const allPagesAnnotated = computed(() => {
    return totalPages.value > 0 && annotatedCount.value === totalPages.value;
  });
  
  const annotationProgress = computed(() => {
    if (totalPages.value === 0) return 0;
    return Math.round((annotatedCount.value / totalPages.value) * 100);
  });
  
  // 方法
  /**
   * 上传 PDF
   */
  async function uploadPDF(file) {
    if (!classId.value.trim()) {
      throw new Error('请输入班级ID');
    }
    
    uploading.value = true;
    error.value = null;
    
    try {
      const response = await wordNotesAPI.uploadPDF(classId.value, file);
      
      if (response.success) {
        taskId.value = response.taskId;
        totalPages.value = response.totalPages;
        pages.value = response.pages;
        
        // 初始化标注数据
        pages.value.forEach(page => {
          pageMeta[page.pageIndex] = {
            date: '',
            session: '',
          };
        });
        
        currentStep.value = 'annotate';
        return response;
      } else {
        throw new Error(response.error || '上传失败');
      }
    } catch (err) {
      error.value = err.message || '上传失败';
      throw err;
    } finally {
      uploading.value = false;
    }
  }
  
  /**
   * 设置页面标注
   */
  function setPageAnnotation(pageIndex, date, session) {
    if (!pageMeta[pageIndex]) {
      pageMeta[pageIndex] = {};
    }
    pageMeta[pageIndex].date = date;
    pageMeta[pageIndex].session = session;
  }
  
  /**
   * 批量设置标注（从当前页开始）
   */
  function batchSetAnnotation(startPageIndex, date, session) {
    for (let i = startPageIndex; i <= totalPages.value; i++) {
      setPageAnnotation(i, date, session);
    }
  }
  
  /**
   * 开始识别
   */
  async function startRecognition() {
    if (!allPagesAnnotated.value) {
      throw new Error('请完成所有页面的标注');
    }
    
    // 构建 pageMeta 数组
    const pageMetaArray = pages.value.map(page => ({
      pageIndex: page.pageIndex,
      date: pageMeta[page.pageIndex].date,
      session: pageMeta[page.pageIndex].session,
    }));
    
    recognizing.value = true;
    recognitionStatus.value = 'processing';
    error.value = null;
    currentStep.value = 'processing';
    
    try {
      const response = await wordNotesAPI.startRecognition(
        taskId.value,
        classId.value,
        pageMetaArray
      );
      
      if (response.success) {
        result.value = response;
        recognitionStatus.value = 'completed';
        currentStep.value = 'result';
        return response;
      } else {
        throw new Error(response.error || '识别失败');
      }
    } catch (err) {
      error.value = err.message || '识别失败';
      recognitionStatus.value = 'failed';
      throw err;
    } finally {
      recognizing.value = false;
    }
  }
  
  /**
   * 查询进度（轮询）
   */
  async function pollProgress() {
    if (!taskId.value) return;
    
    try {
      const progress = await wordNotesAPI.getProgress(taskId.value);
      recognitionProgress.value = progress.progress || 0;
      recognitionStatus.value = progress.status;
      
      if (progress.status === 'completed' || progress.status === 'failed') {
        return false; // 停止轮询
      }
      return true; // 继续轮询
    } catch (err) {
      console.error('查询进度失败:', err);
      return false;
    }
  }
  
  /**
   * 获取页面图片 URL
   */
  function getPageImageUrl(pageIndex) {
    if (!taskId.value) return '';
    return wordNotesAPI.getPageImageUrl(taskId.value, pageIndex);
  }
  
  /**
   * 重置状态
   */
  function reset() {
    currentStep.value = 'upload';
    classId.value = '';
    taskId.value = '';
    totalPages.value = 0;
    pages.value = [];
    Object.keys(pageMeta).forEach(key => delete pageMeta[key]);
    recognitionProgress.value = 0;
    recognitionStatus.value = 'idle';
    result.value = null;
    error.value = null;
    uploading.value = false;
    recognizing.value = false;
  }
  
  return {
    // 状态
    currentStep,
    classId,
    taskId,
    totalPages,
    pages,
    pageMeta,
    recognitionProgress,
    recognitionStatus,
    result,
    error,
    uploading,
    recognizing,
    
    // 计算属性
    annotatedCount,
    allPagesAnnotated,
    annotationProgress,
    
    // 方法
    uploadPDF,
    setPageAnnotation,
    batchSetAnnotation,
    startRecognition,
    pollProgress,
    getPageImageUrl,
    reset,
  };
}

