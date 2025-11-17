import { createRouter, createWebHistory } from 'vue-router';

const SchedulePage = () => import('../pages/SchedulePage.vue');
const SnapshotListPage = () => import('../pages/SnapshotListPage.vue');
const SnapshotDetailPage = () => import('../pages/SnapshotDetailPage.vue');
const EliteHomePage = () => import('../pages/EliteHomePage.vue');
const GeometryLessonPage = () => import('../pages/GeometryLessonPage.vue');

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
