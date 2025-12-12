/**
 * API 接口配置文件
 * 定义所有 API 接口地址的唯一来源
 */

// 学生相关接口
export const STUDENT_API = {
  GET_STUDENTS: '/api/students',
  CREATE_STUDENT: '/api/students',
  UPDATE_STUDENT: (id) => `/api/students/${id}`,
  DELETE_STUDENT: (id) => `/api/students/${id}`,
};

// 课程相关接口
export const COURSE_API = {
  GET_COURSES: '/api/courses',
  CREATE_COURSE: '/api/courses',
  UPDATE_COURSE: (id) => `/api/courses/${id}`,
  DELETE_COURSE: (id) => `/api/courses/${id}`,
};

// 成绩相关接口
export const GRADE_API = {
  CREATE_GRADE: '/api/grades',
  GET_STUDENT_GRADES: (studentId) => `/api/grades/student/${studentId}`,
  GET_STUDENT_GRADES_ANALYSIS: (studentId) => `/api/grades/student/${studentId}/analysis`,
  GET_PAPER_GRADES: '/api/grades/paper',
  PARSE_NATURAL_LANGUAGE: '/api/grades/parse-natural-language',
};

// 课表相关接口
export const SCHEDULE_API = {
  SAVE_SNAPSHOT: '/api/schedule-snapshots/save',
};

// 快照相关接口
export const SNAPSHOT_API = {
  GET_SNAPSHOTS: '/api/schedule-snapshots',
  DELETE_SNAPSHOT: (id) => `/api/schedule-snapshots/${id}`,
  GET_SNAPSHOT: (id) => `/api/schedule-snapshots/${id}`,
  GET_SNAPSHOT_ITEM: (id) => `/api/schedule-snapshot-item/${id}`,
};

// 班级相关接口
export const CLASS_API = {
  GET_CLASSES: '/api/classes',
  CREATE_CLASS: '/api/classes',
  UPDATE_CLASS: (id) => `/api/classes/${id}`,
  DELETE_CLASS: (id) => `/api/classes/${id}`,
  GET_CLASS_DETAILS: (id) => `/api/classes/${id}`,
  ADD_STUDENT_TO_CLASS: (classId, studentId) => `/api/classes/${classId}/students/${studentId}`,
  REMOVE_STUDENT_FROM_CLASS: (classId, studentId) => `/api/classes/${classId}/students/${studentId}`,
};

// 咨询相关接口
export const INQUIRY_API = {
  SUBMIT_INQUIRY: '/api/inquiries',
};

// 单词笔记相关接口
export const WORD_NOTES_API = {
  UPLOAD_PDF: '/api/word-notes/upload-pdf',
  GET_PROGRESS: (taskId) => `/api/word-notes/progress/${taskId}`,
  LIST_JOBS: '/api/word-notes/jobs',
  GET_JOB_DETAIL: (taskId) => `/api/word-notes/jobs/${taskId}`,
  GET_DETAIL_VIEW_DATA: (taskId) => `/api/word-notes/jobs/${taskId}/detail-view`,
};