import { RootStateStore } from '@/types';
import { createStore } from 'vuex';
import forml from './forml';
import formp from './formp';
import pkt from './pkt';
import auth from './auth';
import createPersistedState from 'vuex-persistedstate';

const store = createStore<RootStateStore>({
  state() {
    return { master: null };
  },
  modules: { forml, formp, pkt, auth },
  plugins: [
    createPersistedState({
      paths: ['auth'],
    }),
  ],
});

export default store;
