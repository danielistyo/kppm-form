<template>
  <div class="pkt">
    <progress-spinner v-if="isImporting" class="pkt__loading" />
    <div class="p-fluid pkt__container">
      <Dialog header="Tambah Pkt" v-model:visible="showAddOptions" :style="{ width: '50vw' }" modal dismissable-mask>
        <div class="p-d-flex p-jc-between">
          <button-prime label="Manual" class="p-mx-2" @click="addNewPkt" />
          <button-prime label="Import" class="p-mx-2" @click="importPkt" />
        </div>
        <input ref="importFileEl" type="file" @change="handleInputChange" accept=".csv" class="p-d-none" />
      </Dialog>

      <div class="p-field pkt__top-field">
        <pkt-dropdown v-model="selectedPktKey" :disabled="isSubmittingData" />

        <button-prime
          @click="showAddOptions = !showAddOptions"
          :disabled="isGettingPkt || isSubmittingData"
          icon="pi pi-plus"
          class="p-button-rounded p-button-primary pkt__add"
        />
      </div>

      <form-proposal
        v-if="selectedPktKey || isAddingData"
        @formsubmit="submitPkt"
        :is-loading="isSubmittingData"
        :submit-label="actionButtonLabel"
        :inputs="selectedPktFields"
        :menu-options="['hapus']"
        @remove="deletePkt"
        type="pkt"
        class="pkt__form-proposal"
      />
    </div>
  </div>
  <div></div>
</template>

<script lang="tsx">
import ProgressSpinner from 'primevue/progressspinner';
import ButtonPrime from 'primevue/button';
import { useConfirm } from 'primevue/useconfirm';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import firebase from 'firebase/app';
import { computed, defineComponent, nextTick, ref, unref, watch } from 'vue';
import FormProposal from '@/components/FormProposal';
import PktDropdown from '@/components/@globals/PktDropdown';
import { useStore } from 'vuex';
import { CostFormField, DefaultFormField, PktItem, PktKeys, RootStateStore } from '@/types';
import usePkt from '@/composables/pkt';
import { parseCSV } from '@/helpers/csv';

export default defineComponent({
  name: 'Pkt',
  components: {
    PktDropdown,
    FormProposal,
    ButtonPrime,
    Dialog,
    ProgressSpinner,
  },
  setup() {
    const store = useStore<RootStateStore>();

    const confirm = useConfirm();
    const toast = useToast();

    const isAddingData = ref(false);
    const isSubmittingData = ref(false);
    const showAddOptions = ref(false);
    const selectedPktKey = ref<string>('');
    const { isGettingPkt, selectedPktFields } = usePkt();

    watch(selectedPktKey, (newSelectedPktKey) => {
      store.dispatch('pkt/choosePkt', newSelectedPktKey);
      nextTick(() => {
        document.documentElement.scrollTop = 0;
      });
    });

    const addNewPkt = () => {
      selectedPktKey.value = '';
      nextTick(() => {
        isAddingData.value = true;
      });
      store.commit('pkt/clearFields');
    };

    /* ************* firebase stuff - START ************* */

    const pktRef = firebase.database().ref(`/pkt/${store.getters['auth/selectedGroup']}/`);

    const submitPkt = () => {
      const showDuplicatedToast = () => {
        toast.add({
          severity: 'error',
          summary: 'Terjadi Kesalahan!',
          detail: 'Nama Program sudah ada. Silakan pakai nama lain.',
          life: 5000,
        });
      };

      const showSuccessToast = () => {
        toast.add({
          severity: 'success',
          summary: 'Berhasil disimpan!',
          life: 3000,
        });
      };
      const submitData = async () => {
        isSubmittingData.value = true;

        // create new template PktItem
        const pktObj: PktItem = {
          acuan: '',
          badan_pembantu: '',
          bentuk_kegiatan: '',
          biaya: {},
          keterangan: '',
          nama_program: '',
          nomor_program: '',
          pelaksana: '',
          sasaran_kuantitas: '',
          sumber_dana: { a: 0, b: 0, c: 0 },
          tempat: '',
          tujuan: '',
          ukuran_hasil: '',
          waktu: '',
        };

        // set pkt item template with vuex data
        unref(selectedPktFields).forEach((pktItem: DefaultFormField<PktKeys> | CostFormField<PktKeys>) => {
          // handle biaya only
          if (pktItem.type === 'cost-input' && pktItem.key === 'biaya') {
            pktItem.value?.forEach((cost, index) => {
              pktObj.biaya[index] = cost;
            });
          }
          // handle sumber_dana only
          else if (pktItem.key === 'sumber_dana') {
            pktItem?.children?.forEach((child) => {
              if (typeof child.value === 'number') pktObj.sumber_dana[child.key] = child.value;
            });
          }
          // for the other key
          else if (pktItem.key !== 'biaya') {
            // set high priority for view property first
            if (pktItem.view) pktObj[pktItem.key] = pktItem.view;
            else pktObj[pktItem.key] = pktItem.value as string;
          }
        });

        // check existence of key
        const currentPktKey = pktObj.nama_program.toLowerCase().replaceAll(' ', '-');
        const isDuplicated = !!(await pktRef.child(currentPktKey).once('value')).val();

        // update to firebase
        if (unref(isAddingData)) {
          if (isDuplicated) {
            showDuplicatedToast();
          } else {
            await pktRef.child(currentPktKey).set(pktObj);
            selectedPktKey.value = currentPktKey;
            showSuccessToast();
          }
        } else {
          if (unref(selectedPktKey) !== currentPktKey && isDuplicated) {
            showDuplicatedToast();
          }
          // when selected pkt key is same with nama program value, process update
          else if (unref(selectedPktKey) === currentPktKey) {
            await pktRef.update({ [`${unref(selectedPktKey)}`]: pktObj });
            showSuccessToast();
          }
          // it needs remove old key and its value. then create new one
          else if (unref(selectedPktKey) !== currentPktKey && !isDuplicated) {
            pktRef.child(unref(selectedPktKey)).remove();
            // just wait below not above. because we want to make those 2 requests non blocking
            await pktRef.child(currentPktKey).set(pktObj);
            selectedPktKey.value = currentPktKey;
            showSuccessToast();
          }
        }

        isSubmittingData.value = false;
        isAddingData.value = false;
      };

      confirm.require({
        message: `Anda yakin ingin ${unref(isAddingData) ? 'menambahkan' : 'mengubah'} program di PKT ini?`,
        header: 'Perhatian!',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          submitData();
        },
        reject: () => {
          confirm.close();
        },
      });
    };
    const deletePkt = () => {
      const programName = unref(selectedPktFields).find((val) => val.key === 'nama_program')?.value;
      if (programName) {
        confirm.require({
          message: `Anda yakin ingin menghapus program "${programName}" di PKT ini?`,
          header: 'Perhatian!',
          icon: 'pi pi-exclamation-triangle',
          acceptClass: 'p-button-danger',
          accept: async () => {
            await pktRef.child(unref(selectedPktKey)).remove();
            selectedPktKey.value = '';
            toast.add({
              severity: 'success',
              summary: 'Berhasil dihapus!',
              life: 3000,
            });
          },
          reject: () => {
            confirm.close();
          },
        });
      }
    };
    /* ************* firebase stuff - END ************* */

    const actionButtonLabel = computed((): string => {
      if (unref(isSubmittingData)) return 'Loading...';
      else if (unref(isAddingData)) return 'Tambahkan';
      else return 'Ubah';
    });

    // any can be HTMLElement
    const importFileEl = ref<any | null>(null);
    const isImporting = ref<boolean>(false);
    const handleInputChange = (e: Event) => {
      isImporting.value = true;
      const target = e.target as HTMLInputElement;
      const parsePkt = new Promise((resolve) => {
        parseCSV(target.files, async (pkts: { [key in string]: PktItem[] }) => {
          const arrGroup = Object.keys(pkts);
          for (let indexGroup = 0; indexGroup < arrGroup.length; indexGroup++) {
            const groupName = arrGroup[indexGroup];
            const group = firebase.database().ref(`/pkt/${groupName}/`);

            const arrPkt = pkts[groupName];
            for (let indexPkt = 0; indexPkt < arrPkt.length; indexPkt++) {
              const pkt = arrPkt[indexPkt];
              const currentPktKey = pkt.nama_program.toLowerCase().replaceAll(' ', '-');
              const isDuplicated = !!(await group.child(currentPktKey).once('value')).val();
              if (!isDuplicated) {
                await group.child(currentPktKey).set(pkt);
              }

              // the end of parsing
              if (arrGroup.length - 1 === indexGroup && arrPkt.length - 1 === indexPkt) resolve(true);
            }
          }
        });
      });

      // close loading
      parsePkt.then(() => {
        isImporting.value = false;
        showAddOptions.value = false;
      });

      // clear file value
      if (importFileEl.value) {
        importFileEl.value.value = '';
        if (!/safari/i.test(navigator.userAgent)) {
          importFileEl.value.type = '';
          importFileEl.value.type = 'file';
        }
      }
    };

    const importPkt = () => {
      importFileEl.value?.click();
    };
    return {
      isImporting,
      showAddOptions,
      handleInputChange,
      importFileEl,
      importPkt,
      selectedPktFields,
      selectedPktKey,
      isGettingPkt,
      submitPkt,
      deletePkt,
      isSubmittingData,
      isAddingData,
      addNewPkt,
      actionButtonLabel,
    };
  },
});
</script>

<style lang="scss" scoped>
.pkt {
  max-width: 768px;
  margin: auto;

  &__loading {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    background: #0000007d;
    width: 100vw;
    height: 100vh;
    z-index: 2000;

    ::v-deep(.p-progress-spinner-svg) {
      width: 100px;
      height: 100px;
    }
  }

  &__container {
    position: relative;
  }

  &__top-field {
    display: flex;
    align-items: center;
  }

  &__choices {
    width: calc(100% - 60px);
  }

  &__add {
    margin-left: 12px;
  }

  &__delete,
  .p-button-danger {
    position: absolute;
    width: 90px;
    top: 85px;
    right: 16px;
  }
}
</style>
