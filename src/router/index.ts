import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    meta: {
      title: 'Login',
    },
    component: () => import(/* webpackChunkName: "login-page" */ '../views/Login.vue'),
  },
  {
    path: '/forml',
    name: 'FormL',
    meta: {
      title: 'Form L',
      requiresAuth: true,
    },
    component: () => import(/* webpackChunkName: "forml-page" */ '../views/FormL.vue'),
  },
  {
    path: '/formp',
    name: 'FormP',
    meta: {
      title: 'Form P',
      requiresAuth: true,
    },
    component: () => import(/* webpackChunkName: "formp-page" */ '../views/FormP.vue'),
  },
  {
    path: '/pkt',
    name: 'Pkt',
    meta: {
      title: 'PKT',
      requiresAuth: true,
    },
    component: () => import(/* webpackChunkName: "pkt-page" */ '../views/Pkt.vue'),
  },
  {
    path: '/',
    name: 'Dashboard',
    meta: {
      title: 'Dashboard',
      requiresAuth: true,
    },
    component: () => import(/* webpackChunkName: "dashboard-page" */ '../views/Dashboard.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
