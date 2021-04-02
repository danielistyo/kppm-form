<template>
  <progress-spinner v-if="isLoading" class="login-loading" />
  <div id="firebaseui-auth-container"></div>
</template>

<script lang="ts">
import ProgressSpinner from 'primevue/progressspinner';
import { defineComponent, onMounted, ref } from '@vue/runtime-core';
import firebase from 'firebase/app';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'Login',
  components: {
    ProgressSpinner,
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    const isLoading = ref(false);

    onMounted(() => {
      // FirebaseUI config.
      const uiConfig = {
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        ],
        // tosUrl and privacyPolicyUrl accept either url string or a callback
        // function.
        // Terms of service url/callback.
        tosUrl: process.env.BASE_URL,
        // Privacy policy url/callback.
        privacyPolicyUrl: function() {
          window.location.assign(process.env.BASE_URL);
        },
        signInFlow: 'redirect',
        callbacks: {
          signInSuccessWithAuthResult(authResult: firebase.auth.UserCredential) {
            if (authResult.user && authResult.user.displayName && authResult.user.email) {
              const { uid, displayName, email } = authResult.user;

              const userRef = firebase
                .database()
                .ref('/users/')
                .child(uid);

              const setUserToStore = (user: { name: string; email: string; group: string }) => {
                store.commit('auth/setIsLogin', true);
                store.commit('auth/setName', user.name);
                store.commit('auth/setEmail', user.email);
                store.commit('auth/setGroup', user.group);
              };

              isLoading.value = true;
              userRef
                .once('value')
                .then((res) => {
                  if (!res.val()) {
                    // store new user to db
                    userRef.set({ name: displayName, email, group: '' }).then(() => {
                      setUserToStore({ name: displayName, email, group: '' });

                      store.dispatch('pkt/getPkt');
                    });
                  } else {
                    setUserToStore({ name: displayName, email, group: res.val().group });

                    store.dispatch('pkt/getPkt');
                  }
                })
                .finally(() => {
                  isLoading.value = false;
                  router.push({ name: 'Dashboard' });
                });
            }
            return false;
          },
        },
      };

      // Initialize the FirebaseUI Widget using Firebase.
      const ui =
        firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());
      // The start method will wait until the DOM is loaded.
      ui.start('#firebaseui-auth-container', uiConfig);
    });

    return { isLoading };
  },
});
</script>

<style lang="scss" scoped>
#firebaseui-auth-container {
  margin-top: 200px;

  ::v-deep(.firebaseui-tospp-full-message) {
    display: none;
  }
}
.login-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  background: #0000007d;
  width: 100vw;
  height: 100vh;
  z-index: 3;

  ::v-deep(.p-progress-spinner-svg) {
    width: 100px;
    height: 100px;
  }
}
</style>
