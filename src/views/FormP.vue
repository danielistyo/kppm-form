<template>
  <div class="formp">
    <form-proposal :inputs="formInputs" type="p" class="formp__form-proposal" />
    <form-preview :inputs="formInputs" type="p" class="formp__form-preview" />
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent } from 'vue';
import FormProposal from '@/components/FormProposal';
import FormPreview from '@/components/FormPreview';
import { useStore } from 'vuex';
import { FormFields, FormpKeys } from '@/types';

export default defineComponent({
  name: 'FormP',
  components: {
    FormProposal,
    FormPreview,
  },
  setup() {
    const store = useStore();

    const formInputs: ComputedRef<FormFields<FormpKeys>> = computed<FormFields<FormpKeys>>(
      () => store.state.formp.fields,
    );
    return { formInputs };
  },
});
</script>

<style lang="scss" scoped>
.formp {
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
  .formp {
    .form-proposal {
      display: none;
    }
  }
  body {
    margin: 0;
  }
}
</style>
