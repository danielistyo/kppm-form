<template>
  <div class="main-header">
    <i
      v-if="showSidebar"
      class="pi pi-bars main-header__toggle-sidebar"
      @click="handleSidebarIconClick"
    ></i>
    <span class="main-header__title">{{ $route.meta.title }}</span>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import emitter from '@/emitter';

export default defineComponent({
  name: 'MainHeader',
  props: {
    showSidebar: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const handleSidebarIconClick = () => {
      emitter.emit('sidebar:show', true);
    };
    return { handleSidebarIconClick };
  },
});
</script>

<style src="./MainHeader.scss" lang="scss" scoped></style>
