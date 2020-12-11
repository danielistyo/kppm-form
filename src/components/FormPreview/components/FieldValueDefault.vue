<template>
  <div v-if="needRender" v-html="view || value"></div>
  <div v-else>{{ view || value }}</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FieldValueDefault',
  props: {
    value: {
      type: [String, Array],
      required: true,
    },
    view: {
      type: String,
      required: false,
    },
    needRender: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style></style>
