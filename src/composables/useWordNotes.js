import { ref } from 'vue';
import * as wordNotesAPI from '../api/wordNotes.js';

export function useWordNotes() {
  const currentStep = ref('upload'); // upload, processing, result
  const classId = ref('');
  const taskId = ref('');
  const totalPages = ref(0);
  const pages = ref([]);
  const recognitionProgress = ref(0);
  const recognitionStatus = ref('idle');
  const result = ref(null);
  const error = ref(null);
  const uploading = ref(false);

  async function uploadPDF(file) {
    if (!classId.value.trim()) {
      throw new Error('请输入班级ID');
    }

    uploading.value = true;
    error.value = null;

    try {
      const response = await wordNotesAPI.uploadPDF(classId.value, file);
      if (!response.success) {
        throw new Error(response.error || '上传失败');
      }

      taskId.value = response.taskId;
      totalPages.value = response.totalPages;
      pages.value = response.pages || [];
      currentStep.value = 'processing';
      recognitionStatus.value = 'processing';
      recognitionProgress.value = 0;
      result.value = null;
      return response;
    } catch (err) {
      error.value = err.message || '上传失败';
      throw err;
    } finally {
      uploading.value = false;
    }
  }

  async function pollProgress() {
    if (!taskId.value) return false;
    try {
      const progress = await wordNotesAPI.getProgress(taskId.value);
      recognitionProgress.value = progress.progress ?? 0;
      recognitionStatus.value = progress.status || 'processing';

      if (progress.status === 'completed') {
        result.value = progress.result || null;
        currentStep.value = 'result';
        return false;
      }

      if (progress.status === 'failed') {
        error.value = progress.error || '识别失败';
        currentStep.value = 'result';
        return false;
      }

      return true;
    } catch (err) {
      error.value = err.message || '查询进度失败';
      recognitionStatus.value = 'failed';
      return false;
    }
  }

  function reset() {
    currentStep.value = 'upload';
    classId.value = '';
    taskId.value = '';
    totalPages.value = 0;
    pages.value = [];
    recognitionProgress.value = 0;
    recognitionStatus.value = 'idle';
    result.value = null;
    error.value = null;
    uploading.value = false;
  }

  return {
    currentStep,
    classId,
    taskId,
    totalPages,
    pages,
    recognitionProgress,
    recognitionStatus,
    result,
    error,
    uploading,
    uploadPDF,
    pollProgress,
    reset,
  };
}
