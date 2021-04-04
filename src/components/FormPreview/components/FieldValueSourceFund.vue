<template>
  <div>{{ convertToCurrencyView(value) }}</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FieldValueSourceFund',
  props: {
    value: {
      type: Number,
      required: true,
    },
  },
  methods: {
    convertToCurrencyView(number: number): string {
      return new Intl.NumberFormat('id', { style: 'currency', currency: 'IDR' }).format(number);
    },
  },
});
</script>

<style></style>
