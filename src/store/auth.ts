import { AuthStates, RootStateStore, Groups } from '@/types';
import { Module } from 'vuex';
import firebase from 'firebase/app';
import 'firebase/auth';

const module: Module<AuthStates, RootStateStore> = {
  namespaced: true,
  state: () => ({
    isLogin: false,
    name: '',
    email: '',
    group: null, // { kppm: 'read, write, approve' }
    selectedGroupName: null,
    userId: null,
  }),
  getters: {
    isMultipleGroup(state): boolean {
      return !!state.group && Object.keys(state.group).length > 1;
    },
    selectedGroup(state, getters): string | null {
      if (!state.group) return null;

      if (getters.isMultipleGroup && !state.selectedGroupName) {
        const firstGroup = Object.keys(state.group)[0];
        if (firstGroup) return firstGroup;
      }

      if (Object.keys(state.group).length === 1) {
        const firstGroup = Object.keys(state.group)[0];
        if (firstGroup) {
          return firstGroup;
        }
      }
      return null;
    },
  },
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
    setGroup(state, val: { [g in Groups]?: string }) {
      state.group = val;
    },
    setUserId(state, userId: string) {
      state.userId = userId;
    },
  },
  actions: {
    async logout({ dispatch }) {
      await dispatch('pkt/unsubscribePktValue', null, { root: true });
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
