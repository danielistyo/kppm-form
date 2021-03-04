<template>
  <dropdown
    v-model="value"
    :options="pktChoices"
    :disabled="isGettingPkt || disabled"
    :placeholder="isGettingPkt ? 'Loading...' : 'Pilih PKT Anda di sini'"
    optionLabel="nameChoice"
    optionValue="valueChoice"
    class="pkt__choices"
  />
</template>

<script lang="tsx">
import { defineComponent } from 'vue';
import { computed } from 'vue';
import Dropdown from 'primevue/dropdown';
import pktComposables from '@/composables/pkt';

export default defineComponent({
  components: {
    Dropdown,
  },
  emits: ['update:modelValue'],
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const { isGettingPkt, pktChoices } = pktComposables();

    const value = computed<string>({
      get: () => props.modelValue,
      set: (value: string) => {
        emit('update:modelValue', value);
      },
    });

    return {
      isGettingPkt,
      pktChoices,
      value,
    };
  },
});
</script>

<style></style>
