import { createRouter, createWebHistory } from 'vue-router';

const SchedulePage = () => import('../pages/SchedulePage.vue');
const SnapshotListPage = () => import('../pages/SnapshotListPage.vue');
const SnapshotDetailPage = () => import('../pages/SnapshotDetailPage.vue');
const SnapshotMergePage = () => import('../pages/SnapshotMergePage.vue');
const EliteHomePage = () => import('../pages/EliteHomePage.vue');
const GeometryLessonPage = () => import('../pages/GeometryLessonPage.vue');
const WordNoteProcessPage = () => import('../pages/WordNoteProcessPage.vue');
const WordNoteJobsPage = () => import('../pages/WordNoteJobsPage.vue');
const WordNoteDetailPage = () => import('../pages/WordNoteDetailPage.vue');

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
