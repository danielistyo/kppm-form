<template>
  <editor-input v-model="computedValue" v-if="!disabled">
    <template #toolbar>
      <span class="ql-formats">
        <button class="ql-bold"></button>
        <button class="ql-italic"></button>
        <button class="ql-underline"></button>
      </span>
      <span class="ql-formats">
        <button class="ql-list" value="ordered"></button>
        <button class="ql-list" value="bullet"></button>
      </span>
    </template>
  </editor-input>
  <div v-else v-html="computedValue || '&nbsp;'" class="simple-editor__readonly"></div>
</template>

<script lang="ts">
import EditorInput from 'primevue/editor';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'SimpleEditor',
  components: {
    EditorInput,
  },
  emits: ['update:modelValue', 'update:view'],
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const computedValue = computed<string>({
      get() {
        return props.modelValue;
      },
      set(val) {
        emit('update:modelValue', val);
      },
    });
    return { computedValue };
  },
});
</script>

<style lang="scss" src="./SimpleEditor.scss" scoped></style>
