<template>
  <progress-spinner v-if="isGettingData || isSubmittingData" class="formp-loading" />
  <list-form
    v-if="viewType === 'listView'"
    :list="formpList"
    @addclick="handleAddClicked"
    @selected="handleListSelected"
  />
  <div v-else-if="viewType === 'formView'">
    <div class="formp">
      <button-prime
        v-if="selectedFormpKey && !isAddingData"
        @click="deleteFormp"
        icon="pi pi-times"
        label="Hapus"
        class="p-button-danger p-button-outlined p-button-sm formp__delete"
      ></button-prime>

      <form-proposal
        :inputs="selectedFormpFields"
        :is-loading="isSubmittingData || isGettingData"
        :show-pkt="showPkt"
        @pktchange="handlePktChanged"
        @formsubmit="handleSubmit"
        type="p"
        class="formp__form-proposal"
      />
      <form-preview :inputs="selectedFormpFields" type="p" class="formp__form-preview" />
    </div>
  </div>
</template>

<script lang="ts">
import ProgressSpinner from 'primevue/progressspinner';
import ButtonPrime from 'primevue/button';
import firebase from 'firebase/app';
import { computed, ComputedRef, defineComponent, ref, unref, watch, watchEffect } from 'vue';
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
  FormQueryParams,
  RootStateStoreWithModule,
  SelectedPkt,
} from '@/types';
import dayjs from 'dayjs';
import { useRoute, useRouter } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';

export default defineComponent({
  name: 'FormP',
  components: {
    FormProposal,
    FormPreview,
    ListForm,
    ProgressSpinner,
    ButtonPrime,
  },
  setup() {
    const confirm = useConfirm();
    const router = useRouter();
    const route = useRoute();
    const viewType = ref<'listView' | 'formView'>('listView');
    const isAddingData = ref(true);
    const isSubmittingData = ref(false);
    const selectedFormpKey = ref<string>('');
    const showPkt = ref(true);
    const store = useStore<RootStateStoreWithModule>();
    store.commit('formp/clearFields');

    const isGettingData = computed(() => {
      return store.state.formp.isGettingData;
    });

    const formpList = computed(() => {
      return store.state.formp.list;
    });

    const selectedFormpFields: ComputedRef<FormFields<FormpKeys>> = computed<FormFields<FormpKeys>>(
      () => store.state.formp.fields,
    );

    const handlePktChanged = (selectedPktKey: string): void => {
      const selectedPkt: SelectedPkt = store.getters['pkt/selectedPkt'](selectedPktKey);
      store.commit('formp/updateFormPFields', selectedPkt);
    };

    const formpKppmRef = firebase.database().ref('/formps/kppm/');
    const handleSubmit = async () => {
      isSubmittingData.value = true;

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
        created_at: 0,
        updated_at: 0,
      };

      const dayjsObj = dayjs();
      formpObj.updated_at = dayjsObj.unix();

      // set formp item template with vuex data
      unref(selectedFormpFields).forEach(
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

        router.replace({ query: { action: 'edit', key: newFormpKey } });
      } else {
        await formpKppmRef.update({ [`${unref(selectedFormpKey)}`]: formpObj });
      }
      isSubmittingData.value = false;
    };

    const deleteFormp = () => {
      const programName = unref(selectedFormpFields).find((val) => val.key === 'nama_program')
        ?.value;
      if (programName) {
        confirm.require({
          message: `Anda yakin ingin menghapus Form P "${programName}"?`,
          header: 'Perhatian!',
          icon: 'pi pi-exclamation-triangle',
          acceptClass: 'p-button-danger',
          accept: async () => {
            await formpKppmRef.child(unref(selectedFormpKey)).remove();
            selectedFormpKey.value = '';
            viewType.value = 'listView';
          },
          reject: () => {
            confirm.close();
          },
        });
      }
    };

    const handleAddClicked = () => {
      router.push({ query: { action: 'add' } });
    };

    watchEffect(() => {
      if (unref(formpList).length) {
        store.dispatch('formp/chooseFormp', unref(selectedFormpKey));
      }
    });

    const handleListSelected = (key: string) => {
      store.commit('formp/clearFields');

      router.push({ query: { action: 'edit', key } });
    };

    watch(
      () => route.query,
      (newQuery: FormQueryParams) => {
        if (newQuery && newQuery.action) {
          if (newQuery.action === 'add') {
            store.commit('formp/clearFields');
            viewType.value = 'formView';
            isAddingData.value = true;
            showPkt.value = true;
            selectedFormpKey.value = '';
          } else if (newQuery.action === 'edit' && newQuery.key) {
            viewType.value = 'formView';
            selectedFormpKey.value = newQuery.key;
            showPkt.value = false;
            isAddingData.value = false;
          }
        } else {
          viewType.value = 'listView';
        }
      },
      { immediate: true },
    );

    return {
      showPkt,
      selectedFormpFields,
      handlePktChanged,
      isSubmittingData,
      handleSubmit,
      formpList,
      viewType,
      handleAddClicked,
      handleListSelected,
      isGettingData,
      isAddingData,
      deleteFormp,
      selectedFormpKey,
    };
  },
});
</script>

<style lang="scss" scoped>
.formp-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  background: #0000007d;
  width: 100vw;
  height: 100vh;
  z-index: 3;

  ::v-deep {
    .p-progress-spinner-svg {
      width: 100px;
      height: 100px;
    }
  }
}
.formp {
  display: flex;
  flex-direction: row;

  &__form-proposal {
    width: 400px;
    height: calc(100vh - 16px - 50px);
    overflow: auto;

    @media screen and (max-width: 768px) {
      height: initial;
      max-width: 400px;
    }
  }

  &__delete,
  .p-button-danger[type='button'] {
    position: absolute;
    width: 90px;
    top: 85px;
    right: calc(1rem + 8px);
    background-color: #fff;
    z-index: 2;

    @media screen and (min-width: 400px) {
      left: 300px;
    }
  }

  ::v-deep {
    @media screen and (max-width: 768px) {
      .form-preview {
        display: none;
      }
    }
  }
}
</style>

<style lang="scss">
@media print {
  .formp .form-preview {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    height: auto;
    overflow-y: visible;
    z-index: 100;
    width: 100vw;
    padding: 0;
  }
}
</style>
