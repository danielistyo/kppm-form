import { AuthStates, RootStateStore } from '@/types';
import { Module, Store } from 'vuex';
import firebase from 'firebase/app';
import 'firebase/auth';
import { Router } from 'vue-router';

type RouterProperty = { $router: Router };

const module: Module<AuthStates, RootStateStore> = {
  namespaced: true,
  state: () => ({
    isLogin: false,
    name: '',
    email: '',
    group: '',
  }),
  mutations: {
    setIsLogin(state, val: boolean) {
      state.isLogin = val;
    },
    setName(state, val: string) {
      state.name = val;
    },
  },
  actions: {
    subscribeAuthStatus({ commit, dispatch }) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          commit('setIsLogin', true);
          commit('setName', user.displayName);

          dispatch('pkt/getPkt', null, { root: true });
          dispatch('formp/getFormp', null, { root: true });
          dispatch('forml/getForml', null, { root: true });
        } else {
          commit('setIsLogin', false);
          commit('setName', '');
          (this as Store<RootStateStore> & RouterProperty)?.$router?.replace({ name: 'Login' });

          dispatch('pkt/unsubscribePktValue', null, { root: true });
          dispatch('formp/unsubscribeFormpValue', null, { root: true });
          dispatch('forml/unsubscribeFormlValue', null, { root: true });
        }
      });
    },
  },
};

export default module;
