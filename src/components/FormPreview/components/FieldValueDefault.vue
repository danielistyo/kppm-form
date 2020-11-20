<template>
  {{ view || value }}
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
  },
});
</script>

<style></style>
