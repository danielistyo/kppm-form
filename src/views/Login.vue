<template>
  <div id="firebaseui-auth-container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from '@vue/runtime-core';
import firebase from 'firebase/app';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'Login',
  setup() {
    const router = useRouter();
    const store = useStore();

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

              userRef
                .get()
                .then((res) => {
                  if (!res.val()) {
                    // store new user to db
                    userRef.set({ name: displayName, email, group: '' }).then((res) => {
                      setUserToStore({ name: displayName, email, group: res.val().group });
                    });
                  }
                  setUserToStore({ name: displayName, email, group: res.val().group });
                })
                .finally(() => {
                  store.dispatch('forml/getForml');
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
  },
});
</script>

<style lang="scss" scoped>
#firebaseui-auth-container {
  margin-top: 200px;

  ::v-deep {
    .firebaseui-tospp-full-message {
      display: none;
    }
  }
}
</style>
