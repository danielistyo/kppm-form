import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import './registerServiceWorker';
import router from './router';
import store from './store';
import '@/firebase';
import emitter from './emitter';

import 'primevue/resources/themes/md-light-indigo/theme.css'; //theme
import 'primevue/resources/primevue.min.css'; //core css
import 'primeicons/primeicons.css'; //icons
import 'primeflex/primeflex.css';
import '@/assets/scss/main.scss';
import { Store } from 'vuex';
import { RootStateStore } from './types';
import { Router } from 'vue-router';

// set router to store instance
type StoreWithRouter = Store<RootStateStore> & { $router: Router };
(store as StoreWithRouter).$router = router;

const app = createApp(App)
  .use(store)
  .use(router);

app
  .use(PrimeVue)
  .use(ConfirmationService)
  .use(ToastService);

app.mount('#app');

app.config.globalProperties.$emitter = emitter;
