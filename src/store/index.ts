import { RootStateStore } from '@/types';
import { createStore } from 'vuex';
import forml from './forml';

export default createStore<RootStateStore>({
  state() {
    return { master: null };
  },
  modules: { forml },
});
