import { Choices, FormFields, PktKeys, RootStateStoreWithModule } from '@/types';
import { computed, ComputedRef, ref, watch } from 'vue';
import { useStore } from 'vuex';

export default () => {
  const store = useStore<RootStateStoreWithModule>();

  const isGettingPkt = computed<boolean>(() => {
    return store.state.pkt.isGettingData;
  });
  const selectedPkt: ComputedRef<FormFields<PktKeys>> = computed<FormFields<PktKeys>>(() => {
    return store.state.pkt.fields;
  });

  const pktChoices = computed<Choices>(() => {
    return store.getters['pkt/choices'];
  });

  return {
    isGettingPkt,
    selectedPkt,
    pktChoices,
  };
};
