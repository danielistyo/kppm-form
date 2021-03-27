<template>
  <prime-sidebar :show-close-icon="false" visible position="left" class="main-sidebar">
    <div class="main-sidebar__logo">
      <img class="main-sidebar__logo-image" src="img/gkjw.jpg" />
      <div class="main-sidebar__title">GKJW Rungkut</div>
    </div>
    <hr class="main-sidebar__divider" />
    <div class="main-sidebar__menus">
      <div
        @click="handleMenuClicked('Dashboard')"
        :class="{ 'main-sidebar__menu--active': selectedMenu === 'Dashboard' }"
        class="main-sidebar__menu"
      >
        <i :class="{ 'pi--active': selectedMenu === 'Dashboard' }" class="pi pi-th-large"></i>
        Dashboard
      </div>
      <div
        @click="handleMenuClicked('Pkt')"
        :class="{ 'main-sidebar__menu--active': selectedMenu === 'Pkt' }"
        class="main-sidebar__menu"
      >
        <i :class="{ 'pi--active': selectedMenu === 'Pkt' }" class="pi pi-book"></i>PKT
      </div>
      <div
        @click="handleMenuClicked('FormP')"
        :class="{ 'main-sidebar__menu--active': selectedMenu === 'FormP' }"
        class="main-sidebar__menu"
      >
        <i :class="{ 'pi--active': selectedMenu === 'FormP' }" class="pi pi-file"></i>Form P
      </div>
      <div
        @click="handleMenuClicked('FormL')"
        :class="{ 'main-sidebar__menu--active': selectedMenu === 'FormL' }"
        class="main-sidebar__menu"
      >
        <i :class="{ 'pi--active': selectedMenu === 'FormL' }" class="pi pi-check-square"></i>Form L
      </div>
    </div>
    <button-prime
      @click="handleLogout"
      icon="pi pi-sign-out"
      label="Keluar"
      class="p-button-text main-sidebar__logout"
    />
  </prime-sidebar>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import PrimeSidebar from 'primevue/sidebar';
import { useRoute, useRouter } from 'vue-router';
import emitter from '@/emitter';
import ButtonPrime from 'primevue/button';
import firebase from 'firebase/app';

export default defineComponent({
  name: 'MainSidebar',
  components: {
    PrimeSidebar,
    ButtonPrime,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    type MenuValues = 'Pkt' | 'FormL' | 'FormP' | 'Dashboard';
    const selectedMenu = ref<MenuValues>('Pkt');
    watch<MenuValues>(
      () => route.name as MenuValues,
      (routeName) => {
        selectedMenu.value = routeName;
      },
    );
    const handleMenuClicked = (val: MenuValues) => {
      selectedMenu.value = val;
      router.push({ name: val });
      emitter.emit('sidebar:show', false);
    };

    const handleLogout = () => {
      firebase
        .auth()
        .signOut()
        .then(() => {
          router.push({ name: 'Login' });
          emitter.emit('sidebar:show', false);
        });
    };

    return {
      handleMenuClicked,
      selectedMenu,
      handleLogout,
    };
  },
});
</script>

<style src="./MainSidebar.scss" lang="scss" scoped></style>
