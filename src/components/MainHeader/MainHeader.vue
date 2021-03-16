<template>
  <div class="main-header">
    <i class="pi pi-bars main-header__toggle-sidebar" @click="showSidebar"></i>
    <span class="main-header__title">{{ $route.meta.title }}</span>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import emitter from '@/emitter';

export default defineComponent({
  name: 'MainHeader',
  setup() {
    const showSidebar = () => {
      emitter.emit('sidebar:show', true);
    };
    return { showSidebar };
  },
});
</script>

<style src="./MainHeader.scss" lang="scss" scoped></style>
