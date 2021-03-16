import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import FormL from '@/views/FormL.vue';
import FormP from '@/views/FormP.vue';
import Pkt from '@/views/Pkt.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/forml',
    name: 'FormL',
    meta: {
      title: 'Form L',
    },
    component: FormL,
  },
  {
    path: '/formp',
    name: 'FormP',
    meta: {
      title: 'Form P',
    },
    component: FormP,
  },
  {
    path: '/pkt',
    name: 'Pkt',
    meta: {
      title: 'PKT',
    },
    component: Pkt,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
