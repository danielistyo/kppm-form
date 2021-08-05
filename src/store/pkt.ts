import pktField from '@/data/pkt-field';
import cloneDeep from 'lodash/fp/cloneDeep';
import { PktStates, RootStateStore, PktItem, Choices, FieldCostValue, SelectedPkt } from '@/types';
import { Module } from 'vuex';
import firebase from 'firebase/app';

let onPktValueChange:
  | ((a: firebase.database.DataSnapshot, b?: string | null | undefined) => any)
  | undefined;

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
    parseResponse(state, response: Record<string, PktItem> | null) {
      state.list = [];
      if (response) {
        Object.entries(response).forEach(([key, value]: [string, PktItem]) => {
          state.list.push({
            nameChoice: `${value.badan_pembantu} - ${value.nama_program}`,
            valueChoice: key,
            ...value,
          });
        });
      } else {
        state.list = [];
      }
    },
    // update all fields value using selected pkt
    updatePktFields(state, selectedPkt: SelectedPkt) {
      if (!selectedPkt) return;

      state.fields.forEach((field) => {
        // set sumber dana field
        if (field.key === 'sumber_dana') {
          field.children?.forEach((child) => {
            if (child.key === 'a' || child.key === 'b' || child.key === 'c') {
              const newValue = selectedPkt?.sumber_dana?.[child.key];
              if (newValue === null || newValue === undefined) {
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
    updateField(
      state,
      {
        key,
        value,
        view,
      }: {
        key: string;
        value: string | number | Array<FieldCostValue> | Array<string> | null;
        view: string | null;
      },
    ) {
      const copyOfFields = cloneDeep(state.fields);
      // find object as key value, then update value and view
      copyOfFields.find((field) => {
        const isFound = field.key === key;
        if (isFound) {
          if (value !== null) field.value = value;
          if (typeof field.view === 'string' && typeof view === 'string') field.view = view;
        }
        return isFound;
      });
      // assign to state
      state.fields = copyOfFields;
    },
  },
  getters: {
    choices(state): Choices {
      return state.list.map(({ nameChoice, valueChoice }) => ({
        nameChoice,
        valueChoice,
      }));
    },
    selectedPkt(state): Function {
      return (key: string): SelectedPkt | undefined =>
        state.list.find(({ valueChoice }) => valueChoice === key);
    },
  },
  actions: {
    getPkt({ commit, state, rootGetters }): void {
      const pktRef = firebase.database().ref(`/pkt/${rootGetters['auth/selectedGroup']}/`);
      state.isGettingData = true;
      onPktValueChange = pktRef.on(
        'value',
        (snapshot) => {
          state.isGettingData = false;
          commit('parseResponse', snapshot.val());

          // update current selected fields
          const selectedPktNameValue = state.fields.find((field) => field.key === 'nama_program')
            ?.value;
          const selectedPkt = state.list.find((pkt) => pkt.nama_program === selectedPktNameValue);
          commit('updatePktFields', selectedPkt);
        },
        (err) => {
          console.error(err);
        },
      );
    },
    unsubscribePktValue({ rootGetters }) {
      if (onPktValueChange) {
        return firebase
          .database()
          .ref(`/pkt/${rootGetters['auth/selectedGroup']}/`)
          .off('value', onPktValueChange);
      } else {
        return Promise.resolve('there is no pkt subscription');
      }
    },
    choosePkt({ commit, getters }, key: string): void {
      if (!key) return;

      const selectedPkt: SelectedPkt = getters.selectedPkt(key);
      selectedPkt && commit('updatePktFields', selectedPkt);
    },
  },
};

export default module;
