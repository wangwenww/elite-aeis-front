import { createRouter, createWebHistory } from 'vue-router';

const SchedulePage = () => import('../pages/schedule/SchedulePage.vue');
const SnapshotListPage = () => import('../pages/snapshot/SnapshotListPage.vue');
const SnapshotDetailPage = () => import('../pages/snapshot/SnapshotDetailPage.vue');
const SnapshotMergePage = () => import('../pages/snapshot/SnapshotMergePage.vue');
const EliteHomePage = () => import('../pages/home/EliteHomePage.vue');
const GeometryLessonPage = () => import('../pages/utils/GeometryLessonPage.vue');
const WordNoteProcessPage = () => import('../pages/wordnotes/WordNoteProcessPage.vue');
const WordNoteJobsPage = () => import('../pages/wordnotes/WordNoteJobsPage.vue');
const WordNoteDetailPage = () => import('../pages/wordnotes/WordNoteDetailPage.vue');
const ClassListPage = () => import('../pages/class/ClassList.vue');
const ClassDetailPage = () => import('../pages/class/ClassDetail.vue');
const GradeEntryPage = () => import('../pages/grade/GradeEntry.vue');
const GradeDisplayPage = () => import('../pages/grade/GradeDisplay.vue');
const StudentGradesPage = () => import('../pages/student/StudentGrades.vue');
const StudentListPage = () => import('../pages/student/StudentList.vue');
const StudentGradeAnalysisPage = () => import('../pages/student/StudentGradeAnalysis.vue');
const PhotoCropPage = () => import('../pages/utils/PhotoCropPage.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'schedule',
      component: SchedulePage,
      meta: {
        title: '月度课时费管理系统',
      },
    },
    {
      path: '/snapshots',
      name: 'snapshot-list',
      component: SnapshotListPage,
      meta: {
        title: '课表快照管理',
      },
    },
    {
      path: '/snapshots/:id',
      name: 'snapshot-detail',
      component: SnapshotDetailPage,
      meta: {
        title: '课表快照详情',
      },
    },
    {
      path: '/snapshots-merge',
      name: 'snapshot-merge',
      component: SnapshotMergePage,
      meta: {
        title: '快照合并查看',
      },
    },
    {
      path: '/elite',
      name: 'elite-home',
      component: EliteHomePage,
      meta: {
        title: 'Elite Edu 公司主页',
      },
    },
    {
      path: '/geometry-lesson',
      name: 'geometry-lesson',
      component: GeometryLessonPage,
      meta: {
        title: '几何公式课堂',
      },
    },
    {
      path: '/word-notes',
      name: 'word-notes',
      component: WordNoteProcessPage,
      meta: {
        title: '英语单词笔记处理',
      },
    },
    {
      path: '/word-notes/jobs',
      name: 'word-notes-jobs',
      component: WordNoteJobsPage,
      meta: {
        title: '识别记录管理',
      },
    },
    {
      path: '/word-notes/jobs/:taskId',
      name: 'word-notes-detail',
      component: WordNoteDetailPage,
      meta: {
        title: '识别详情',
      },
    },
    {
      path: '/classes',
      name: 'class-list',
      component: ClassListPage,
      meta: { title: '班级管理' },
    },
    {
      path: '/classes/:id',
      name: 'class-detail',
      component: ClassDetailPage,
      meta: { title: '班级详情' },
    },
    {
      path: '/grades/entry',
      name: 'grade-entry',
      component: GradeEntryPage,
      meta: { title: '成绩录入' },
    },
    {
      path: '/grades/display',
      name: 'grade-display',
      component: GradeDisplayPage,
      meta: { title: '试卷成绩展示' },
    },
    {
      path: '/students/:id/grades',
      name: 'student-grades',
      component: StudentGradesPage,
      meta: { title: '学生成绩档案' },
    },
    {
      path: '/students',
      name: 'student-list',
      component: StudentListPage,
      meta: { title: '学生管理' },
    },
    {
      path: '/students/:id/analysis',
      name: 'student-grade-analysis',
      component: StudentGradeAnalysisPage,
      meta: { title: '成绩分析' },
    },
    {
      path: '/photo-crop',
      name: 'photo-crop',
      component: PhotoCropPage,
      meta: { title: '照片裁剪工具' },
    },
    {
      path: '/payment-form',
      name: 'payment-form',
      component: () => import('../pages/payment/CoursePayment.vue'),
      meta: { title: '课程缴费单' },
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

router.afterEach((to) => {
  if (typeof document !== 'undefined') {
    document.title = to.meta.title ? `${to.meta.title} | ELIET AEIS` : 'ELIET AEIS';
  }
});

export default router;
