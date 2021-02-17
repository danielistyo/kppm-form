<template>
  <div class="forml">
    <form-proposal :inputs="formInputs" type="l" class="forml__form-proposal" />
    <form-preview :inputs="formInputs" type="l" class="forml__form-preview" />
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent } from 'vue';
import FormProposal from '@/components/FormProposal';
import FormPreview from '@/components/FormPreview';
import { useStore } from 'vuex';
import { FormFields, FormlKeys } from '@/types';

export default defineComponent({
  name: 'FormL',
  components: {
    FormProposal,
    FormPreview,
  },
  setup() {
    const store = useStore();

    const formInputs: ComputedRef<FormFields<FormlKeys>> = computed<FormFields<FormlKeys>>(
      () => store.state.forml.fields,
    );
    return { formInputs };
  },
});
</script>

<style lang="scss" scoped>
.forml {
  display: flex;
  flex-direction: row;

  &__form-proposal {
    max-width: 400px;
    height: calc(100vh - 16px);
  }
}
</style>

<style lang="scss">
@media print {
  .forml {
    .form-proposal {
      display: none;
    }
  }
  body {
    margin: 0;
  }
}
</style>
