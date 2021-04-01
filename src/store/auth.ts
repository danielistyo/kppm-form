import { AuthStates, RootStateStore } from '@/types';
import { Module } from 'vuex';
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
    setEmail(state, val: string) {
      state.email = val;
    },
    setGroup(state, val: string) {
      state.group = val;
    },
  },
  actions: {
    logout({ dispatch }) {
      return firebase
        .auth()
        .signOut()
        .then(() => {
          dispatch('clearUserData');
        });
    },
    clearUserData({ commit }) {
      commit('setIsLogin', false);
      commit('setName', '');
      commit('setEmail', '');
      commit('setGroup', '');
    },
  },
};

export default module;
