import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import './registerServiceWorker';
import router from './router';
import store from './store';
import '@/firebase';

import 'primevue/resources/themes/md-light-indigo/theme.css'; //theme
import 'primevue/resources/primevue.min.css'; //core css
import 'primeicons/primeicons.css'; //icons
import 'primeflex/primeflex.css';
import '@/assets/scss/main.scss';

const app = createApp(App)
  .use(store)
  .use(router);

app.use(PrimeVue);

app.mount('#app');
