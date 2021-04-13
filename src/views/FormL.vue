<template>
  <progress-spinner v-if="isGettingData || isSubmittingData" class="forml-loading" />
  <list-form
    v-if="viewType === 'listView'"
    :list="formlList"
    @addclick="handleAddClicked"
    @selected="handleListSelected"
  />
  <div v-else-if="viewType === 'formView'" class="forml">
    <button-prime
      v-if="selectedFormlKey && !isAddingData"
      @click="deleteForml"
      icon="pi pi-times"
      label="Hapus"
      class="p-button-danger p-button-outlined p-button-sm formp__delete"
    ></button-prime>

    <form-proposal
      :inputs="selectedFormlFields"
      :is-loading="isSubmittingData || isGettingData"
      :show-pkt="showPkt"
      @pktchange="handlePktChanged"
      @formsubmit="handleSubmit"
      type="l"
      class="forml__form-proposal"
    />
    <form-preview :inputs="selectedFormlFields" type="l" class="forml__form-preview" />
  </div>
</template>

<script lang="ts">
import ProgressSpinner from 'primevue/progressspinner';
import ButtonPrime from 'primevue/button';
import {
  computed,
  ComputedRef,
  defineComponent,
  onUnmounted,
  ref,
  unref,
  watch,
  watchEffect,
} from 'vue';
import FormProposal from '@/components/FormProposal';
import FormPreview from '@/components/FormPreview';
import ListForm from '@/components/ListForm';
import { useStore } from 'vuex';
import {
  CostFormField,
  DefaultFormField,
  FormFields,
  FormlItem,
  FormlKeys,
  FormQueryParams,
  RootStateStoreWithModule,
  SelectedPkt,
} from '@/types';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import firebase from 'firebase/app';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

export default defineComponent({
  name: 'FormL',
  components: {
    FormProposal,
    FormPreview,
    ListForm,
    ProgressSpinner,
    ButtonPrime,
  },
  setup() {
    const confirm = useConfirm();
    const toast = useToast();
    const router = useRouter();
    const route = useRoute();
    const isAddingData = ref(true);
    const isSubmittingData = ref(false);
    const viewType = ref<'listView' | 'formView'>('listView');
    const selectedFormlKey = ref<string>('');
    const showPkt = ref(true);
    const store = useStore<RootStateStoreWithModule>();

    const isGettingData = computed(() => {
      return store.state.forml.isGettingData;
    });

    const formlList = computed(() => {
      return store.state.forml.list;
    });

    const selectedFormlFields: ComputedRef<FormFields<FormlKeys>> = computed<FormFields<FormlKeys>>(
      () => store.state.forml.fields,
    );

    const pktKey = ref<string>('');
    const handlePktChanged = (selectedPktKey: string): void => {
      pktKey.value = selectedPktKey;
      const selectedPkt: SelectedPkt = store.getters['pkt/selectedPkt'](selectedPktKey);
      store.commit('forml/updateFormLFields', selectedPkt);
    };

    store.dispatch('forml/getForml');
    onUnmounted(() => {
      store.dispatch('forml/unsubscribeFormlValue');
    });

    const formlRef = firebase.database().ref(`/formls/${store.state.auth.group}/`);
    const handleSubmit = async () => {
      isSubmittingData.value = true;

      const currentFormPData = unref(formlList).find(
        (forml) => forml.key === unref(selectedFormlKey),
      );

      const formlObj: FormlItem = {
        creator_id: currentFormPData?.creator_id || firebase?.auth()?.currentUser?.uid || '',
        pkt: unref(pktKey),
        badan_pembantu: '',
        biaya: {},
        keberhasilan: '',
        kendala: '',
        lampiran: '',
        nama_program: '',
        nomor_program: '',
        pelaksana: '',
        pelaksanaan_kegiatan: '',
        sumber_dana: { a: 0, b: 0, c: 0 },
        tempat: '',
        tujuan: '',
        usulan: '',
        waktu: '',
        created_at: currentFormPData?.created_at || 0,
        updated_at: 0,
      };

      const dayjsObj = dayjs();
      formlObj.updated_at = dayjsObj.unix();

      // set forml item template with vuex data
      unref(selectedFormlFields).forEach(
        (formlItem: DefaultFormField<FormlKeys> | CostFormField<FormlKeys>) => {
          // handle biaya only
          if (formlItem.key === 'biaya') {
            if (formlItem.type === 'cost-input') {
              formlItem.value?.forEach((cost, index) => {
                formlObj.biaya[index] = cost;
              });
            }
          }
          // handle sumber_dana only
          else if (formlItem.key === 'sumber_dana') {
            formlItem?.children?.forEach((child) => {
              if (typeof child.value === 'number') formlObj.sumber_dana[child.key] = child.value;
            });
          }
          // for the other key
          else {
            // set high priority for view property first
            if (formlItem.view) formlObj[formlItem.key] = formlItem.view;
            else formlObj[formlItem.key] = formlItem.value as string;
          }
        },
      );

      try {
        // add new data
        if (unref(isAddingData)) {
          formlObj.created_at = formlObj.updated_at;
          const newForml = await formlRef.push();
          newForml.set(formlObj);

          router.replace({ query: { action: 'edit', key: newForml.key } });
        }
        // update existing data
        else {
          await formlRef.update({ [`${unref(selectedFormlKey)}`]: formlObj });
        }
        isSubmittingData.value = false;
        toast.add({
          severity: 'success',
          summary: 'Form L berhasil disimpan!',
          life: 3000,
        });
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Terjadi Kesalahan!',
          life: 5000,
        });
      }
    };

    const deleteForml = () => {
      const programName = unref(selectedFormlFields).find((val) => val.key === 'nama_program')
        ?.value;
      if (programName) {
        confirm.require({
          message: `Anda yakin ingin menghapus Form L "${programName}"?`,
          header: 'Perhatian!',
          icon: 'pi pi-exclamation-triangle',
          acceptClass: 'p-button-danger',
          accept: async () => {
            try {
              await formlRef.child(unref(selectedFormlKey)).remove();
              selectedFormlKey.value = '';
              viewType.value = 'listView';

              toast.add({
                severity: 'success',
                summary: 'Form L berhasil dihapus!',
                life: 3000,
              });
              router.replace({ query: {} });
            } catch (error) {
              console.log(error);
              toast.add({
                severity: 'error',
                summary: 'Terjadi Kesalahan!',
                life: 5000,
              });
            }
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

    const handleListSelected = (key: string) => {
      store.commit('forml/clearFields');

      router.push({ query: { action: 'edit', key } });
    };

    watchEffect(() => {
      if (unref(formlList).length) {
        store.dispatch('forml/chooseForml', unref(selectedFormlKey));
      }
    });

    watch(
      () => route.query,
      (newQuery: FormQueryParams) => {
        if (newQuery && newQuery.action) {
          if (newQuery.action === 'add') {
            store.commit('forml/clearFields');
            viewType.value = 'formView';
            isAddingData.value = true;
            showPkt.value = true;
            selectedFormlKey.value = '';
          } else if (newQuery.action === 'edit' && newQuery.key) {
            viewType.value = 'formView';
            selectedFormlKey.value = newQuery.key;
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
      selectedFormlFields,
      selectedFormlKey,
      isAddingData,
      isSubmittingData,
      viewType,
      isGettingData,
      showPkt,
      formlList,
      handleAddClicked,
      handleListSelected,
      handleSubmit,
      handlePktChanged,
      deleteForml,
    };
  },
});
</script>

<style lang="scss" scoped>
.forml-loading {
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

  ::v-deep(.p-progress-spinner-svg) {
    width: 100px;
    height: 100px;
  }
}
.forml {
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

  @media screen and (max-width: 768px) {
    ::v-deep(.form-preview) {
      display: none;
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
}
</style>

<style lang="scss">
@media print {
  .forml .form-preview {
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
