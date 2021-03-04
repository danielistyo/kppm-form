<template>
  <div class="formp">
    <form-proposal
      :inputs="formInputs"
      @pktchange="handlePktChanged"
      type="p"
      class="formp__form-proposal"
      show-pkt
    />
    <form-preview :inputs="formInputs" type="p" class="formp__form-preview" />
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent } from 'vue';
import FormProposal from '@/components/FormProposal';
import FormPreview from '@/components/FormPreview';
import { useStore } from 'vuex';
import { FormFields, FormpKeys, SelectedPkt } from '@/types';

export default defineComponent({
  name: 'FormP',
  components: {
    FormProposal,
    FormPreview,
  },
  setup() {
    const store = useStore();
    store.commit('formp/clearFields');

    const formInputs: ComputedRef<FormFields<FormpKeys>> = computed<FormFields<FormpKeys>>(
      () => store.state.formp.fields,
    );

    const handlePktChanged = (selectedPktKey: string): void => {
      const selectedPkt: SelectedPkt = store.getters['pkt/selectedPkt'](selectedPktKey);
      store.commit('formp/updateFormPFields', selectedPkt);
    };

    return { formInputs, handlePktChanged };
  },
});
</script>

<style lang="scss" scoped>
.formp {
  display: flex;
  flex-direction: row;

  &__form-proposal {
    max-width: 400px;
    height: calc(100vh - 16px - 50px);
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
