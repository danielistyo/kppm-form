<template>
  <div class="pkt">
    <div class="p-fluid">
      <div class="p-field form-proposal__field">
        <dropdown
          v-model="chosenPkt"
          :options="choices"
          optionLabel="nameChoice"
          optionValue="valueChoice"
          placeholder="Pilih PKT Anda di sini"
        />
      </div>

      <template v-if="chosenPkt">
        <form-proposal :inputs="selectedPkt" type="pkt" class="pkt__form-proposal" />

        <div class="pkt__footer">
          <button-prime @click="submitPkt" class="pkt__submit">Ubah</button-prime>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import Dropdown from 'primevue/dropdown';
import ButtonPrime from 'primevue/button';
import firebase from 'firebase/app';
import { computed, ComputedRef, defineComponent, ref, watch } from 'vue';
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

    const choices = computed(() => {
      return store.getters['pkt/choices'];
    });

    const chosenPkt = ref<string>('');
    watch(chosenPkt, (chosenPkt) => {
      store.commit('pkt/choosePkt', chosenPkt);
    });

    const selectedPkt: ComputedRef<FormFields<PktKeys>> = computed<FormFields<PktKeys>>(() => {
      return store.state.pkt.fields;
    });

    const fields: ComputedRef<FormFields<PktKeys>> = computed<FormFields<PktKeys>>(() => {
      return store.state.pkt.fields;
    });

    const isGettingPkt = ref(true);
    firebase
      .database()
      .ref('/pkt/kppm/')
      .on('value', (snapshot) => {
        isGettingPkt.value = false;
        store.commit('pkt/parseResponse', snapshot.val());
      });

    const submitPkt = () => {
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

      firebase
        .database()
        .ref('/pkt/kppm/')
        .update({ [`${chosenPkt.value}`]: pktObj });
    };

    return { selectedPkt, choices, chosenPkt, isGettingPkt, fields, submitPkt };
  },
});
</script>

<style lang="scss" scoped>
.pkt {
  max-width: 768px;
  margin: auto;

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
