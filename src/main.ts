import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';

import 'primevue/resources/themes/mdc-dark-indigo/theme.css'; //theme
import 'primevue/resources/primevue.min.css'; //core css
import 'primeicons/primeicons.css'; //icons

const app = createApp(App)
  .use(store)
  .use(router);

app.mount('#app');
