<template>
  <div id="firebaseui-auth-container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from '@vue/runtime-core';
import firebase from 'firebase/app';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';

export default defineComponent({
  name: 'Login',
  setup() {
    onMounted(() => {
      // FirebaseUI config.
      const uiConfig = {
        signInSuccessUrl: process.env.BASE_URL,
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
        signInFlow: 'popup',
      };

      // Initialize the FirebaseUI Widget using Firebase.
      const ui = new firebaseui.auth.AuthUI(firebase.auth());
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
