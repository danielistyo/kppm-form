<template>
  <main-header :show-sidebar="showSidebar" />
  <main-sidebar v-if="showSidebar" v-model:visible="isSidebarOpen" />
  <confirm-dialog />
  <toast />
  <div class="main-container">
    <router-view />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted, ref, watch } from 'vue';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import MainSidebar from './components/MainSidebar/MainSidebar.vue';
import MainHeader from './components/MainHeader/MainHeader.vue';
import emitter from '@/emitter';
import { useStore } from 'vuex';
import { RootStateStoreWithModule } from './types';
import { useRouter } from 'vue-router';
import firebase from 'firebase/app';

export default defineComponent({
  name: 'App',
  components: {
    ConfirmDialog,
    MainSidebar,
    MainHeader,
    Toast,
  },
  setup() {
    const store = useStore<RootStateStoreWithModule>();

    firebase.auth().onAuthStateChanged((user) => {
      if (user?.uid) {
        store.commit('auth/setUserId', user.uid);

        firebase
          .database()
          .ref('/users/')
          .child(user.uid)
          .on('value', (res) => {
            store.commit('auth/setIsLogin', true);
            store.commit('auth/setName', user.displayName);
            store.commit('auth/setEmail', user.email);
            store.commit('auth/setGroup', res.val().group);
            store.commit('auth/setSignature', res.val().signature);
          });
      }
    });

    const isSidebarOpen = ref(false);
    emitter.on('sidebar:show', (isShow) => {
      isSidebarOpen.value = isShow;
    });

    const showSidebar = ref(true);
    const isLogin = computed(() => {
      return store.state.auth.isLogin;
    });

    watch(
      isLogin,
      (isLoginNew) => {
        if (isLoginNew) {
          store.dispatch('pkt/getPkt');

          store.dispatch('formp/getFormp');
          onUnmounted(() => {
            store.dispatch('formp/unsubscribeFormpValue');
          });

          store.dispatch('forml/getForml');
          onUnmounted(() => {
            store.dispatch('forml/unsubscribeFormlValue');
          });
        }
      },
      { immediate: true },
    );

    const router = useRouter();
    router.beforeEach((to, from, next) => {
      const isAuthorizedPage = to.matched.some((record) => record.meta.requiresAuth);
      const { isLogin, email, group } = store.state.auth;
      const isUserAuthenticated = isLogin && email && group;

      if (to.name !== 'Login' && isAuthorizedPage && !isUserAuthenticated) {
        next({ name: 'Login' });
        showSidebar.value = false;
      } else if (to.name === 'Login' && isUserAuthenticated) {
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
