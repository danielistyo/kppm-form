<template>
  <main-header :show-sidebar="showSidebar" />
  <main-sidebar v-if="showSidebar" v-model:visible="isSidebarOpen" />
  <confirm-dialog />
  <div class="main-container">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ConfirmDialog from 'primevue/confirmdialog';
import MainSidebar from './components/MainSidebar/MainSidebar.vue';
import MainHeader from './components/MainHeader/MainHeader.vue';
import emitter from '@/emitter';
import { useStore } from 'vuex';
import { RootStateStoreWithModule } from './types';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'App',
  components: {
    ConfirmDialog,
    MainSidebar,
    MainHeader,
  },
  setup() {
    const store = useStore<RootStateStoreWithModule>();
    store.dispatch('pkt/getPkt');
    store.dispatch('formp/getFormp');
    store.dispatch('forml/getForml');
    store.dispatch('auth/subscribeAuthStatus');

    const isSidebarOpen = ref(false);
    emitter.on('sidebar:show', (isShow) => {
      isSidebarOpen.value = isShow;
    });

    const showSidebar = ref(true);

    const router = useRouter();
    router.beforeEach((to, from, next) => {
      const isAuthorizedPage = to.matched.some((record) => record.meta.requiresAuth);
      const isLogin = store.state.auth.isLogin;

      if (to.name !== 'Login' && isAuthorizedPage && !isLogin) {
        next({ name: 'Login' });
        showSidebar.value = false;
      } else if (to.name === 'Login' && isLogin) {
        next({ name: 'Dashboard' });
        showSidebar.value = true;
      } else {
        next();
        showSidebar.value = to.name !== 'Login';
      }
    });
    return { isSidebarOpen, showSidebar };
  },
});
</script>

<style lang="scss" scoped>
.main-container {
  margin-top: 62px;
}
</style>
