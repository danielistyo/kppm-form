<template>
  <div class="pkt">
    <div class="p-fluid pkt__container">
      <div class="p-field pkt__top-field">
        <pkt-dropdown v-model="selectedPktKey" :disabled="isSubmittingData" />

        <button-prime
          @click="addNewPkt"
          :disabled="isGettingPkt || isSubmittingData"
          icon="pi pi-plus"
          class="p-button-rounded p-button-primary pkt__add"
        />
      </div>

      <button-prime
        v-if="selectedPktKey && !isAddingData"
        @click="deletePkt"
        icon="pi pi-times"
        label="Hapus"
        class="p-button-danger p-button-outlined p-button-sm pkt__delete"
      ></button-prime>

      <form-proposal
        v-if="selectedPktKey || isAddingData"
        @formsubmit="submitPkt"
        :is-loading="isSubmittingData"
        :submit-label="actionButtonLabel"
        :inputs="selectedPktFields"
        type="pkt"
        class="pkt__form-proposal"
      />
    </div>
  </div>
  <div></div>
</template>

<script lang="tsx">
import ButtonPrime from 'primevue/button';
import { useConfirm } from 'primevue/useconfirm';
import firebase from 'firebase/app';
import { computed, defineComponent, nextTick, ref, unref, watch } from 'vue';
import FormProposal from '@/components/FormProposal';
import PktDropdown from '@/components/@globals/PktDropdown';
import { useStore } from 'vuex';
import {
  CostFormField,
  DefaultFormField,
  PktItem,
  PktKeys,
  RootStateStoreWithModule,
} from '@/types';
import usePkt from '@/composables/pkt';

export default defineComponent({
  name: 'Pkt',
  components: {
    PktDropdown,
    FormProposal,
    ButtonPrime,
  },
  setup() {
    const store = useStore<RootStateStoreWithModule>();

    const confirm = useConfirm();

    const isAddingData = ref(false);
    const isSubmittingData = ref(false);
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
    const pktKppmRef = firebase.database().ref('/pkt/kppm/');

    const submitPkt = () => {
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
        unref(selectedPktFields).forEach(
          (pktItem: DefaultFormField<PktKeys> | CostFormField<PktKeys>) => {
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
          },
        );

        // update to firebase
        if (unref(isAddingData)) {
          const newPktKey = `${new Date().getFullYear()}-${pktObj.nama_program
            .toLowerCase()
            .replace(' ', '-')}`;
          await pktKppmRef.child(newPktKey).set(pktObj);
          selectedPktKey.value = newPktKey;
        } else {
          await pktKppmRef.update({ [`${unref(selectedPktKey)}`]: pktObj });
        }

        isSubmittingData.value = false;
        isAddingData.value = false;
      };

      confirm.require({
        message: `Anda yakin ingin ${
          unref(isAddingData) ? 'menambahkan' : 'mengubah'
        } program di PKT ini?`,
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
            await pktKppmRef.child(unref(selectedPktKey)).remove();
            selectedPktKey.value = '';
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

    return {
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
