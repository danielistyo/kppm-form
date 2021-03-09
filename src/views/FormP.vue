<template>
  <div class="formp">
    <form-proposal
      :inputs="formInputs"
      @pktchange="handlePktChanged"
      @formsubmit="handleSubmit"
      type="p"
      class="formp__form-proposal"
      show-pkt
    />
    <form-preview
      :inputs="formInputs"
      :is-loading="isSubmittingData"
      type="p"
      class="formp__form-preview"
    />
  </div>
</template>

<script lang="ts">
import firebase from 'firebase/app';
import { computed, ComputedRef, defineComponent, nextTick, ref, unref } from 'vue';
import FormProposal from '@/components/FormProposal';
import FormPreview from '@/components/FormPreview';
import { useStore } from 'vuex';
import {
  CostFormField,
  DefaultFormField,
  FormFields,
  FormpItem,
  FormpKeys,
  SelectedPkt,
} from '@/types';
import dayjs from 'dayjs';

export default defineComponent({
  name: 'FormP',
  components: {
    FormProposal,
    FormPreview,
  },
  setup() {
    const isAddingData = ref(true);
    const isSubmittingData = ref(false);
    const store = useStore();
    store.commit('formp/clearFields');

    const formInputs: ComputedRef<FormFields<FormpKeys>> = computed<FormFields<FormpKeys>>(
      () => store.state.formp.fields,
    );

    const handlePktChanged = (selectedPktKey: string): void => {
      const selectedPkt: SelectedPkt = store.getters['pkt/selectedPkt'](selectedPktKey);
      store.commit('formp/updateFormPFields', selectedPkt);

      // scroll to top
      nextTick(() => {
        const formProposalEl = document.querySelector('.form-proposal');
        if (formProposalEl) formProposalEl.scrollTop = 0;
      });
    };

    const formpKppmRef = firebase.database().ref('/formps/kppm/');
    const handleSubmit = async () => {
      isSubmittingData.value = true;

      /*  eslint-disable @typescript-eslint/camelcase */
      const formpObj: FormpItem = {
        badan_pembantu: '',
        bentuk_kegiatan: '',
        biaya: {},
        lampiran: '',
        nama_program: '',
        nomor_program: '',
        pelaksana: '',
        pihak_luar: '',
        sasaran_kuantitas: '',
        sumber_dana: { a: 0, b: 0, c: 0 },
        tempat: '',
        tujuan: '',
        ukuran_hasil: '',
        waktu: '',
      };
      /* eslint-enable */

      // set pkt item template with vuex data
      unref(formInputs).forEach(
        (formpItem: DefaultFormField<FormpKeys> | CostFormField<FormpKeys>) => {
          // handle biaya only
          if (formpItem.type === 'cost-input' && formpItem.key === 'biaya') {
            formpItem.value?.forEach((cost, index) => {
              formpObj.biaya[index] = cost;
            });
          }
          // handle sumber_dana only
          else if (formpItem.key === 'sumber_dana') {
            formpItem?.children?.forEach((child) => {
              if (typeof child.value === 'number') formpObj.sumber_dana[child.key] = child.value;
            });
          }
          // for the other key
          else if (formpItem.key !== 'biaya') {
            // set high priority for view property first
            if (formpItem.view) formpObj[formpItem.key] = formpItem.view;
            else formpObj[formpItem.key] = formpItem.value as string;
          }
        },
      );

      // update to firebase
      if (unref(isAddingData)) {
        const date = dayjs().format('YYYY-MM');
        const newFormpKey = `${date}-${formpObj.nama_program.toLowerCase().replace(/\s/g, '-')}`;
        await formpKppmRef.child(newFormpKey).set(formpObj);
      } else {
        // await formpKppmRef.update({ [`${unref(selectedPktKey)}`]: formpObj });
      }

      isSubmittingData.value = false;
    };

    return { formInputs, handlePktChanged, isSubmittingData, handleSubmit };
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
    overflow: auto;
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
