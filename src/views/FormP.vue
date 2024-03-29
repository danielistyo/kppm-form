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
      <form-proposal
        :inputs="selectedFormpFields"
        :is-loading="isSubmittingData || isGettingData"
        :show-pkt="showPkt"
        :status="selectedFormpData ? selectedFormpData.status || 1 : null"
        :menuOptions="menuOptions"
        @pktchange="handlePktChanged"
        @formsubmit="handleSubmit"
        @remove="deleteFormp"
        @propose="proposeFormp"
        @cancel="cancelFormp"
        type="p"
        class="formp__form-proposal"
      />
      <form-preview :inputs="selectedFormpFields" type="p" class="formp__form-preview" />
    </div>
  </div>
</template>

<script lang="ts">
import ProgressSpinner from 'primevue/progressspinner';
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
  RootStateStore,
  SelectedPkt,
} from '@/types';
import dayjs from 'dayjs';
import { useRoute, useRouter } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import {
  APPROVAL_STATUS_DRAFT,
  APPROVAL_STATUS_REJECTED,
  APPROVAL_STATUS_WAITING,
} from '@/constants';

export default defineComponent({
  name: 'FormP',
  components: {
    FormProposal,
    FormPreview,
    ListForm,
    ProgressSpinner,
  },
  setup() {
    const confirm = useConfirm();
    const toast = useToast();
    const router = useRouter();
    const route = useRoute();
    const viewType = ref<'listView' | 'formView'>('listView');
    const isAddingData = ref(true);
    const isSubmittingData = ref(false);
    const selectedFormpKey = ref<string>('');
    const showPkt = ref(true);
    const store = useStore<RootStateStore>();
    store.commit('formp/clearFields');

    const isGettingData = computed(() => {
      return store.state.formp.isGettingData;
    });

    const formpList = computed(() => {
      return store.state.formp.list;
    });

    const selectedFormpData = computed(() => {
      return unref(formpList).find((item) => item.key === unref(selectedFormpKey));
    });

    const selectedFormpFields: ComputedRef<FormFields<FormpKeys>> = computed<FormFields<FormpKeys>>(
      () => store.state.formp.fields,
    );

    const pktKey = ref<string>('');
    const handlePktChanged = (selectedPktKey: string): void => {
      pktKey.value = selectedPktKey;
      const selectedPkt: SelectedPkt = store.getters['pkt/selectedPkt'](selectedPktKey);
      store.commit('formp/updateFormPFields', selectedPkt);
    };

    const formpRef = firebase.database().ref(`/formps/${store.getters['auth/selectedGroup']}/`);
    const handleSubmit = async () => {
      isSubmittingData.value = true;

      const currentFormPData = unref(formpList).find(
        (formp) => formp.key === unref(selectedFormpKey),
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
      const draftLampiran = selectedFormpFields.value.find((field) => field.key === 'lampiran');
      // when current image doesn't exist in draft formp lampiran at all, then remove all images
      if (currentFormPData?.lampiran) {
        if (Array.isArray(draftLampiran?.value) && !draftLampiran?.value.length) {
          await currentFormPData?.lampiran?.forEach(async (currentImage: string) => {
            await removeFirebaseImage(currentImage);
          });
        }
        // when current image doesn't exist in draft formp lampiran, then remove image
        else {
          await currentFormPData?.lampiran?.forEach(async (currentImage: string) => {
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
      const formpObj: FormpItem = {
        creator_id: currentFormPData?.creator_id || firebase?.auth()?.currentUser?.uid || '',
        pkt: unref(pktKey),
        badan_pembantu: '',
        bentuk_kegiatan: '',
        biaya: {},
        lampiran: [],
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
        created_at: currentFormPData?.created_at || 0,
        updated_at: 0,
        status: APPROVAL_STATUS_DRAFT,
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
          } else if (formpItem.key === 'lampiran') {
            formpObj[formpItem.key] = formpItem.value as string[];
          }
          // for the other key
          else if (formpItem.key !== 'biaya') {
            // set high priority for view property first
            if (formpItem.view) formpObj[formpItem.key] = formpItem.view;
            else formpObj[formpItem.key] = formpItem.value as string;
          }
        },
      );

      try {
        // update to firebase
        if (unref(isAddingData)) {
          formpObj.created_at = formpObj.updated_at;
          const newFormp = await formpRef.push();
          newFormp.set(formpObj);

          router.replace({ query: { action: 'edit', key: newFormp.key } });
        } else {
          await formpRef.update({ [`${unref(selectedFormpKey)}`]: formpObj });
        }
        isSubmittingData.value = false;
        toast.add({
          severity: 'success',
          summary: 'Form P berhasil disimpan!',
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
            try {
              await formpRef.child(unref(selectedFormpKey)).remove();
              selectedFormpKey.value = '';
              viewType.value = 'listView';

              toast.add({
                severity: 'success',
                summary: 'Form P berhasil dihapus!',
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

    const proposeFormp = () => {
      isSubmittingData.value = true;
      store
        .dispatch('formp/updateStatus', {
          selectedKey: unref(selectedFormpKey),
          status: APPROVAL_STATUS_WAITING,
        })
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Form P sedang diajukan. Mohon tunggu.',
            life: 3000,
          });
          isSubmittingData.value = false;
        });
    };

    const cancelFormp = () => {
      isSubmittingData.value = true;
      store
        .dispatch('formp/updateStatus', {
          selectedKey: unref(selectedFormpKey),
          status: APPROVAL_STATUS_DRAFT,
        })
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Pengajuan Form P dibatalkan.',
            life: 3000,
          });
          isSubmittingData.value = false;
        });
    };

    const handleAddClicked = () => {
      router.push({ query: { action: 'add' } });
    };

    watch([formpList, selectedFormpKey], async () => {
      if (unref(formpList).length) {
        await store.dispatch('formp/chooseFormp', unref(selectedFormpKey));
        pktKey.value = selectedFormpData.value?.pkt || '';
      }
    });

    const handleListSelected = (key: string) => {
      store.commit('formp/clearFields');

      // temporary comment. to be checked
      // router.push({ query: { action: 'edit', key } });
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
          selectedFormpKey.value = '';
        }
      },
      { immediate: true },
    );

    const menuOptions = ref<string[]>([]);
    watchEffect(() => {
      if (!unref(isAddingData)) {
        const tempMenu: string[] = [];
        const status = unref(selectedFormpData)?.status || 1;
        if ([APPROVAL_STATUS_DRAFT, APPROVAL_STATUS_REJECTED].includes(status)) {
          tempMenu.push('hapus');
        }

        if ([APPROVAL_STATUS_DRAFT, APPROVAL_STATUS_REJECTED].includes(status))
          tempMenu.push('ajukan');

        if (status === APPROVAL_STATUS_WAITING) tempMenu.push('batalkan');

        menuOptions.value = tempMenu;
      } else {
        menuOptions.value = [];
      }
    });

    return {
      menuOptions,
      showPkt,
      selectedFormpFields,
      selectedFormpData,
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
      proposeFormp,
      cancelFormp,
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

  ::v-deep(.p-progress-spinner-svg) {
    width: 100px;
    height: 100px;
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

  @media screen and (max-width: 768px) {
    ::v-deep(.form-preview) {
      display: none;
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
