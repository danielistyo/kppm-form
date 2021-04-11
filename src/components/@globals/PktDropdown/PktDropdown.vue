<template>
  <dropdown
    v-model="value"
    :options="completePktChoices"
    :disabled="isGettingPkt || disabled"
    :placeholder="isGettingPkt ? 'Loading...' : placeholder"
    optionLabel="nameChoice"
    optionValue="valueChoice"
    class="pkt__choices"
  />
</template>

<script lang="tsx">
import { defineComponent, unref } from 'vue';
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
      default: '',
    },
    placeholder: {
      type: String,
      default: 'Pilih PKT Anda di sini',
    },
    showAllOption: {
      type: Boolean,
      default: false,
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

    const completePktChoices = computed(() => {
      if (props.showAllOption) {
        return [
          {
            nameChoice: 'Semua',
            valueChoice: '',
          },
          ...unref(pktChoices),
        ];
      }
      return unref(pktChoices);
    });

    return {
      isGettingPkt,
      completePktChoices,
      value,
    };
  },
});
</script>

<style lang="scss">
.pkt__choices {
  .p-dropdown-panel .p-dropdown-items .p-dropdown-item {
    overflow-wrap: break-word;
    word-wrap: break-word;
    hyphens: auto;
    white-space: normal;
    overflow: visible;
  }
}
</style>
