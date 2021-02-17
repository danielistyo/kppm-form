import { RootStateStore } from '@/types';
import { createStore } from 'vuex';
import forml from './forml';
import formp from './formp';
import pkt from './pkt';

export default createStore<RootStateStore>({
  state() {
    return { master: null };
  },
  modules: { forml, formp, pkt },
});
