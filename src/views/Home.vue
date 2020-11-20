<template>
  <div class="home">
    <form-l class="home__forml" />
    <form-preview class="home__form-preview" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FormL from '@/components/FormL';
import FormPreview from '@/components/FormPreview';

export default defineComponent({
  name: 'Home',
  components: {
    FormL,
    FormPreview,
  },
});
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: row;
}
</style>

<style lang="scss">
@media print {
  .home {
    .forml {
      display: none;
    }
  }
  body {
    margin: 0;
  }
}
</style>
