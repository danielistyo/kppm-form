import { AuthStates, RootStateStore } from '@/types';
import { Module } from 'vuex';
import firebase from 'firebase/app';
import 'firebase/auth';

const module: Module<AuthStates, RootStateStore> = {
  namespaced: true,
  state: () => ({
    isLogin: false,
    name: '',
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
    subscribeAuthStatus({ commit }) {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          commit('setIsLogin', true);
          commit('setName', user.displayName);
        } else {
          commit('setIsLogin', false);
          commit('setName', '');
        }
      });
    },
  },
};

export default module;
