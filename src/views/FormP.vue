<template>
  <list-form
    v-if="viewType === 'listView'"
    :list="formpList"
    @addclick="handleAddClicked"
    @selected="handleListSelected"
  />
  <div v-else-if="viewType === 'formView'">
    <div @click="viewType = 'listView'" class="p-mb-3">&lt; Kembali</div>
    <div class="formp">
      <form-proposal
        :inputs="formInputs"
        :is-loading="isSubmittingData"
        :show-pkt="showPkt"
        @pktchange="handlePktChanged"
        @formsubmit="handleSubmit"
        type="p"
        class="formp__form-proposal"
      />
      <form-preview :inputs="formInputs" type="p" class="formp__form-preview" />
    </div>
  </div>
</template>

<script lang="ts">
import firebase from 'firebase/app';
import { computed, ComputedRef, defineComponent, nextTick, ref, unref } from 'vue';
import FormProposal from '@/components/FormProposal';
import FormPreview from '@/components/FormPreview';
import ListForm from '@/components/ListForm';
import { useStore } from 'vuex';
import {
  CostFormField,
  DefaultFormField,
  FormFields,
  FormpItem,
  FormpKeys,
  RequestData,
  RootStateStoreWithModule,
  SelectedPkt,
} from '@/types';
import dayjs from 'dayjs';

export default defineComponent({
  name: 'FormP',
  components: {
    FormProposal,
    FormPreview,
    ListForm,
  },
  setup() {
    const viewType = ref<'listView' | 'formView'>('listView');
    const isAddingData = ref(true);
    const isSubmittingData = ref(false);
    const showPkt = ref(true);
    const store = useStore<RootStateStoreWithModule>();
    store.commit('formp/clearFields');

    const scrollTop = () => {
      const formProposalEl = document.querySelector('.form-proposal');
      if (formProposalEl) formProposalEl.scrollTop = 0;
    };

    const formpList = computed(() => {
      return store.state.formp.list;
    });

    const formInputs: ComputedRef<FormFields<FormpKeys>> = computed<FormFields<FormpKeys>>(
      () => store.state.formp.fields,
    );

    const handlePktChanged = (selectedPktKey: string): void => {
      const selectedPkt: SelectedPkt = store.getters['pkt/selectedPkt'](selectedPktKey);
      store.commit('formp/updateFormPFields', selectedPkt);

      // scroll to top
      nextTick(scrollTop);
    };

    const formpKppmRef = firebase.database().ref('/formps/kppm/');
    const handleSubmit = async () => {
      isSubmittingData.value = true;

      const formpObj: FormpItem & RequestData = {
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
        created_at: 0,
        updated_at: 0,
      };

      const dayjsObj = dayjs();
      formpObj.updated_at = dayjsObj.unix();

      // set formp item template with vuex data
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
        formpObj.created_at = formpObj.updated_at;
        const date = dayjsObj.format('YYYY-MM');
        const newFormpKey = `${date}-${formpObj.nama_program.toLowerCase().replace(/\s/g, '-')}-${
          formpObj.created_at
        }`;
        await formpKppmRef.child(newFormpKey).set(formpObj);
      } else {
        // await formpKppmRef.update({ [`${unref(selectedPktKey)}`]: formpObj });
      }
      isSubmittingData.value = false;
    };

    const handleAddClicked = () => {
      store.commit('formp/clearFields');
      viewType.value = 'formView';
      showPkt.value = true;

      // scroll to top
      nextTick(scrollTop);
    };

    const handleListSelected = (key: string) => {
      store.commit('formp/clearFields');
      viewType.value = 'formView';
      store.dispatch('formp/chooseFormp', key);
      showPkt.value = false;

      // scroll to top
      nextTick(scrollTop);
    };

    return {
      showPkt,
      formInputs,
      handlePktChanged,
      isSubmittingData,
      handleSubmit,
      formpList,
      viewType,
      handleAddClicked,
      handleListSelected,
    };
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
