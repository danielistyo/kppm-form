<template>
  <div class="pkt">
    <div class="p-fluid">
      <div class="p-field pkt__top-field">
        <dropdown
          v-model="selectedPktKey"
          :options="pktChoices"
          :disabled="isGettingPkt || isSubmittingData"
          :placeholder="isGettingPkt ? 'Loading...' : 'Pilih PKT Anda di sini'"
          optionLabel="nameChoice"
          optionValue="valueChoice"
          class="pkt__choices"
        />
        <button-prime
          @click="addNewPkt"
          :disabled="isGettingPkt || isSubmittingData"
          icon="pi pi-plus"
          class="p-button-rounded p-button-primary pkt__add"
        />
      </div>

      <template v-if="selectedPktKey || isAddingData">
        <form-proposal :inputs="selectedPkt" type="pkt" class="pkt__form-proposal" />

        <div class="pkt__footer">
          <button-prime @click="submitPkt" :disabled="isSubmittingData" class="pkt__submit">
            {{ actionButtonLabel }}
          </button-prime>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import Dropdown from 'primevue/dropdown';
import ButtonPrime from 'primevue/button';
import { useConfirm } from 'primevue/useconfirm';
import firebase from 'firebase/app';
import { computed, ComputedRef, defineComponent, onUnmounted, ref, watch } from 'vue';
import FormProposal from '@/components/FormProposal';
import { useStore } from 'vuex';
import {
  CostFormField,
  DefaultFormField,
  FormFields,
  PktItem,
  PktKeys,
  RootStateStoreWithModule,
} from '@/types';

export default defineComponent({
  name: 'Pkt',
  components: {
    FormProposal,
    Dropdown,
    ButtonPrime,
  },
  setup() {
    const store = useStore<RootStateStoreWithModule>();

    const confirm = useConfirm();

    const isGettingPkt = ref(true);
    const selectedPktKey = ref<string>('');
    watch(selectedPktKey, (selectedPktKey) => {
      store.commit('pkt/choosePkt', selectedPktKey);
    });
    const selectedPkt: ComputedRef<FormFields<PktKeys>> = computed<FormFields<PktKeys>>(() => {
      return store.state.pkt.fields;
    });
    const pktChoices = computed(() => {
      return store.getters['pkt/choices'];
    });

    const isAddingData = ref(false);
    const addNewPkt = () => {
      isAddingData.value = !isAddingData.value;
      store.commit('pkt/clearFields');
    };

    /* ************* firebase stuff - START ************* */
    const pktKppmRef = firebase.database().ref('/pkt/kppm/');

    const onPktKppmValueChange = pktKppmRef.on('value', (snapshot) => {
      isGettingPkt.value = false;
      store.commit('pkt/parseResponse', snapshot.val());
    });

    onUnmounted(() => {
      pktKppmRef.off('value', onPktKppmValueChange);
    });

    const isSubmittingData = ref(false);

    const submitPkt = () => {
      const submitData = async () => {
        isSubmittingData.value = true;

        /*  eslint-disable @typescript-eslint/camelcase */
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
        /* eslint-enable */

        selectedPkt.value.forEach((pktItem: DefaultFormField<PktKeys> | CostFormField<PktKeys>) => {
          if (pktItem.type === 'cost-input' && pktItem.key === 'biaya') {
            pktItem.value?.forEach((cost, index) => {
              pktObj.biaya[index] = cost;
            });
          } else if (pktItem.key === 'sumber_dana') {
            pktItem?.children?.forEach((child) => {
              pktObj.sumber_dana[child.key] = child.value as number;
            });
          } else if (pktItem.key !== 'biaya') {
            pktObj[pktItem.key] = pktItem.value as string;
          }
        });

        if (isAddingData.value) {
          const newPktKey = `${new Date().getFullYear()}-${pktObj.nama_program
            .toLowerCase()
            .replace(' ', '-')}`;
          await pktKppmRef.child(newPktKey).set(pktObj);
        } else {
          await pktKppmRef.update({ [`${selectedPktKey.value}`]: pktObj });
        }

        isSubmittingData.value = false;
      };

      confirm.require({
        message: `Anda yakin ingin ${isAddingData.value ? 'menambahkan' : 'mengubah'} data ini?`,
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
    /* ************* firebase stuff - END ************* */

    const actionButtonLabel = computed((): string => {
      if (isSubmittingData.value) return 'Loading...';
      else if (isAddingData.value) return 'Tambahkan';
      else return 'Ubah';
    });

    return {
      selectedPkt,
      pktChoices,
      selectedPktKey,
      isGettingPkt,
      submitPkt,
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

  &__top-field {
    display: flex;
    align-items: center;
  }

  &__choices {
    width: calc(100% - 60px);
  }

  &__add {
    margin-left: 12px;
    width: 20%;
  }

  &__form-proposal {
    margin-bottom: 60px;
  }

  &__submit.p-button {
    justify-content: center;
    width: 100%;
  }

  &__footer {
    max-width: 768px;
    position: fixed;
    bottom: 10px;
    right: 5px;
    left: 5px;
    margin: auto;
  }
}
</style>
