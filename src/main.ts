import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
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

const app = createApp(App)
  .use(store)
  .use(router);

app.use(PrimeVue).use(ConfirmationService);

app.mount('#app');

app.config.globalProperties.$emitter = emitter;
