import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import FormL from '@/views/FormL.vue';
import FormP from '@/views/FormP.vue';
import Pkt from '@/views/Pkt.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/forml',
    name: 'FormL',
    component: FormL,
  },
  {
    path: '/formp',
    name: 'FormP',
    component: FormP,
  },
  {
    path: '/pkt',
    name: 'Pkt',
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
