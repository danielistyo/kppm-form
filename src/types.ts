export interface FieldCostValue {
  name: string;
  count: number;
  price: number;
}

interface BasicFormField<K> {
  key: K;
  id?: number;
  name: string;
  children?: FormFields<SumberDanaKey>;
  fieldValue: string;
  props?: Record<string, string | boolean | null | number | undefined | string[]>;
}

export interface CostFormField<K> extends BasicFormField<K> {
  type: 'cost-input';
  value?: Array<FieldCostValue>;
}

export interface DefaultFormField<K> extends BasicFormField<K> {
  type: 'input-text' | 'input-number' | 'simple-editor' | 'calendar-input' | 'text-area' | null;
  value?: string | number | Array<FieldCostValue>;
}

export type FormFields<K> = Array<DefaultFormField<K> | CostFormField<K>>;

export interface CostItem {
  name: string;
  count: number;
  price: number;
  frequency?: number;
}

export type CostItems = Array<CostItem>;

/**** START STORE TYPE *****/

export interface FormModule<K> {
  fields: FormFields<K>;
}

export type Choice = { nameChoice: string; valueChoice: string };
export type Choices = Array<Choice>;

export type FormpKeys =
  | 'acuan'
  | 'badan_pembantu'
  | 'bentuk_kegiatan'
  | 'biaya'
  | 'lampiran'
  | 'nama_program'
  | 'nomor_program'
  | 'pelaksana'
  | 'pihak_luar'
  | 'sasaran_kuantitas'
  | 'sumber_dana'
  | 'tempat'
  | 'tujuan'
  | 'ukuran_hasil'
  | 'waktu';

export type FormlKeys =
  | 'badan_pembantu'
  | 'biaya'
  | 'keberhasilan'
  | 'kendala'
  | 'lampiran'
  | 'nama_program'
  | 'nomor_program'
  | 'pelaksana'
  | 'pelaksanaan_kegiatan'
  | 'sumber_dana'
  | 'tempat'
  | 'tujuan'
  | 'usulan'
  | 'waktu';

export type PktKeys =
  | 'acuan'
  | 'badan_pembantu'
  | 'bentuk_kegiatan'
  | 'biaya'
  | 'keterangan'
  | 'nama_program'
  | 'nomor_program'
  | 'pelaksana'
  | 'sasaran_kuantitas'
  | 'sumber_dana'
  | 'tempat'
  | 'tujuan'
  | 'ukuran_hasil'
  | 'waktu';

export type SumberDanaKey = 'a' | 'b' | 'c';
type SumberDana = { [k in SumberDanaKey]: number };
type BiayaItem = { [k: number]: FieldCostValue };

export type PktItem = {
  acuan: string;
  badan_pembantu: string;
  bentuk_kegiatan: string;
  biaya: BiayaItem;
  keterangan: string;
  nama_program: string;
  nomor_program: string;
  pelaksana: string;
  sasaran_kuantitas: string;
  sumber_dana: SumberDana;
  tempat: string;
  tujuan: string;
  ukuran_hasil: string;
  waktu: string;
};

export type SelectedPkt = (PktItem & Choice) | undefined;

type ListPktItem = Array<PktItem & Choice>;
export interface PktStates extends FormModule<PktKeys> {
  list: ListPktItem;
  isGettingData: boolean;
}

export interface PktModule extends PktStates {
  choices: Choices;
}

export interface RootStateStore {
  master: null | string;
}

export interface RootStateStoreWithModule {
  master: null | string;
  pkt: PktStates;
  formp: FormModule<FormpKeys>;
  forml: FormModule<FormlKeys>;
}

/**** END STORE TYPE *****/
