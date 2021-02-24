import pktField from '@/data/pkt-field';
import cloneDeep from 'lodash/fp/cloneDeep';
import { PktStates, RootStateStore, PktItem, Choices, FieldCostValue } from '@/types';
import { Module } from 'vuex';
import firebase from 'firebase/app';

const module: Module<PktStates, RootStateStore> = {
  namespaced: true,
  state: () => ({
    // selected/new pkt fields
    fields: cloneDeep(pktField),
    // it should be array of object in order to be reactive when new object is coming
    // don't use object, because data from firebase is object as well. Then it will not be reactive.
    list: [],
    isGettingData: false,
  }),
  mutations: {
    clearFields(state) {
      state.fields = cloneDeep(pktField);
    },
    parseResponse(state, response: Record<string, PktItem>) {
      state.list = [];
      Object.entries(response).forEach(([key, value]: [string, PktItem]) => {
        state.list.push({ nameChoice: key, valueChoice: key, ...value });
      });
    },
    // update all fields value using selected pkt
    choosePkt(state, key: string) {
      if (!key) return;

      const selectedPkt = state.list.find(({ nameChoice }) => nameChoice === key);
      state.fields.forEach((field) => {
        // set sumber dana field
        if (field.key === 'sumber_dana') {
          field.children?.forEach((child) => {
            if (child.key === 'a' || child.key === 'b' || child.key === 'c') {
              const newValue = selectedPkt?.sumber_dana?.[child.key];
              if (!newValue) {
                child.value = 0;
                return;
              }
              child.value = newValue;
            }
          });
        }
        // set biaya field
        else if (field.key === 'biaya') {
          if (selectedPkt?.biaya) {
            const data: Array<FieldCostValue> = [];
            // loop selectedPkt instead
            Object.values(selectedPkt?.biaya).forEach((biayaItem) => {
              data.push(biayaItem);
            });
            field.value = data;
          } else {
            field.value = [];
          }
        } else {
          field.value = selectedPkt?.[field.key];
        }
      });
    },
  },
  getters: {
    choices(state): Choices {
      return state.list.map(({ nameChoice, valueChoice }) => ({ nameChoice, valueChoice }));
    },
  },
  actions: {
    getPkt({ commit, state }) {
      const pktKppmRef = firebase.database().ref('/pkt/kppm/');
      state.isGettingData = true;
      pktKppmRef.on('value', (snapshot) => {
        state.isGettingData = false;
        commit('parseResponse', snapshot.val());
      });
    },
  },
};

export default module;
