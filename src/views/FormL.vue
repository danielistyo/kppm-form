<template>
  <progress-spinner v-if="isGettingData || isSubmittingData" class="forml-loading" />
  <list-form
    v-if="viewType === 'listView'"
    :list="formlList"
    @addclick="handleAddClicked"
    @selected="handleListSelected"
  />
  <div v-else-if="viewType === 'formView'" class="forml">
    <form-proposal
      :inputs="selectedFormlFields"
      :is-loading="isSubmittingData || isGettingData"
      :show-pkt="showPkt"
      :status="selectedFormlData ? selectedFormlData.status || 1 : null"
      :menuOptions="menuOptions"
      @pktchange="handlePktChanged"
      @formsubmit="handleSubmit"
      @remove="deleteForml"
      @propose="proposeForml"
      @cancel="cancelForml"
      type="l"
      class="forml__form-proposal"
    />
    <form-preview :inputs="selectedFormlFields" type="l" class="forml__form-preview" />
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import ProgressSpinner from 'primevue/progressspinner';
import ButtonPrime from 'primevue/button';
import {
  computed,
  ComputedRef,
  defineComponent,
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
  RootStateStore,
  SelectedPkt,
} from '@/types';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import firebase from 'firebase/app';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import {
  APPROVAL_STATUS_DRAFT,
  APPROVAL_STATUS_REJECTED,
  APPROVAL_STATUS_WAITING,
} from '@/constants';

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
    const store = useStore<RootStateStore>();

    const isGettingData = computed(() => {
      return store.state.forml.isGettingData;
    });

    const formlList = computed(() => {
      return store.state.forml.list;
    });
    const selectedFormlData = computed(() => {
      return unref(formlList).find((item) => item.key === unref(selectedFormlKey));
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

    const formlRef = firebase.database().ref(`/formls/${store.getters['auth/selectedGroup']}/`);
    const handleSubmit = async () => {
      isSubmittingData.value = true;

      const currentFormLData = unref(formlList).find(
        (forml) => forml.key === unref(selectedFormlKey),
      );

      // remove deleted image first
      const removeFirebaseImage = async (currentImage: string): Promise<void> => {
        const res = currentImage.match(/(?<=%2F)(.*)(?=\?alt=media)/);
        const filename = res?.length ? res[0] : '';
        await firebase
          .storage()
          .ref()
          .child('uploads/')
          .child(filename)
          .delete();
      };
      const draftLampiran = selectedFormlFields.value.find((field) => field.key === 'lampiran');
      // when current image doesn't exist in draft forml lampiran at all, then remove all images
      if (currentFormLData?.lampiran) {
        if (Array.isArray(draftLampiran?.value) && !draftLampiran?.value.length) {
          await currentFormLData?.lampiran?.forEach(async (currentImage: string) => {
            await removeFirebaseImage(currentImage);
          });
        }
        // when current image doesn't exist in draft forml lampiran, then remove image
        else {
          await currentFormLData?.lampiran?.forEach(async (currentImage: string) => {
            if (
              Array.isArray(draftLampiran?.value) &&
              draftLampiran?.value.length &&
              !(draftLampiran?.value as string[]).includes(currentImage)
            ) {
              await removeFirebaseImage(currentImage);
            }
          });
        }
      }

      const formlObj: FormlItem = {
        creator_id: currentFormLData?.creator_id || firebase?.auth()?.currentUser?.uid || '',
        pkt: unref(pktKey),
        badan_pembantu: '',
        biaya: {},
        keberhasilan: '',
        kendala: '',
        lampiran: [],
        nama_program: '',
        nomor_program: '',
        pelaksana: '',
        pelaksanaan_kegiatan: '',
        sumber_dana: { a: 0, b: 0, c: 0 },
        tempat: '',
        tujuan: '',
        usulan: '',
        waktu: '',
        created_at: currentFormLData?.created_at || 0,
        updated_at: 0,
        status: APPROVAL_STATUS_DRAFT,
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
          } else if (formlItem.key === 'lampiran') {
            formlObj[formlItem.key] = formlItem.value as string[];
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
      if (typeof programName === 'string') {
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

    const proposeForml = () => {
      isSubmittingData.value = true;
      store
        .dispatch('forml/updateStatus', {
          selectedKey: unref(selectedFormlKey),
          status: APPROVAL_STATUS_WAITING,
        })
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Form L sedang diajukan. Mohon tunggu.',
            life: 3000,
          });
          isSubmittingData.value = false;
        });
    };

    const cancelForml = () => {
      isSubmittingData.value = true;
      store
        .dispatch('forml/updateStatus', {
          selectedKey: unref(selectedFormlKey),
          status: APPROVAL_STATUS_DRAFT,
        })
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Pengajuan Form L dibatalkan.',
            life: 3000,
          });
          isSubmittingData.value = false;
        });
    };

    const handleAddClicked = () => {
      router.push({ query: { action: 'add' } });
    };

    const handleListSelected = (key: string) => {
      store.commit('forml/clearFields');

      router.push({ query: { action: 'edit', key } });
    };

    watch([formlList, selectedFormlKey], () => {
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
          selectedFormlKey.value = '';
        }
      },
      { immediate: true },
    );

    const menuOptions = ref<string[]>([]);
    watchEffect(() => {
      if (!unref(isAddingData)) {
        const tempMenu: string[] = [];
        const status = unref(selectedFormlData)?.status || 1;
        if ([APPROVAL_STATUS_DRAFT, APPROVAL_STATUS_REJECTED].includes(status)) {
          tempMenu.push('hapus');
        }

        if (status === APPROVAL_STATUS_DRAFT) tempMenu.push('ajukan');

        if (status === APPROVAL_STATUS_WAITING) tempMenu.push('batalkan');

        menuOptions.value = tempMenu;
      } else {
        menuOptions.value = [];
      }
    });

    return {
      menuOptions,
      selectedFormlFields,
      selectedFormlKey,
      selectedFormlData,
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
      proposeForml,
      cancelForml,
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
