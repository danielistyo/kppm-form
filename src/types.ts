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
  view?: string;
}

export interface CostFormField<K> extends BasicFormField<K> {
  type: 'cost-input';
  value?: Array<FieldCostValue>;
}

export interface DefaultFormField<K> extends BasicFormField<K> {
  type:
    | 'input-text'
    | 'input-number'
    | 'simple-editor'
    | 'calendar-input'
    | 'text-area'
    | 'image-uploader'
    | null;
  value?: string | number | Array<FieldCostValue> | Array<string>;
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
  isGettingData: boolean;
}

export type Choice = { nameChoice: string; valueChoice: string };
export type Choices = Array<Choice>;

export type FormpKeys =
  | 'creator_id'
  | 'creator_name'
  | 'approver_id'
  | 'pkt'
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
  | 'creator_id'
  | 'creator_name'
  | 'approver_id'
  | 'pkt'
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

type ApprovalStatusRejected = 4;
type ApprovalStatusApproved = 3;
type ApprovalStatusWaiting = 2;
type ApprovalStatusDraft = 1;
export type ApprovalStatus =
  | ApprovalStatusRejected
  | ApprovalStatusApproved
  | ApprovalStatusWaiting
  | ApprovalStatusDraft;

type ApprovalData = {
  creator_id: string;
  creator_name?: string;
  approver_id?: string;
  status: ApprovalStatus;
};

export type SumberDanaKey = 'a' | 'b' | 'c';
type SumberDana = { [k in SumberDanaKey]: number };
type BiayaItem = { [k: number]: FieldCostValue };

type RequestData = {
  created_at: number;
  updated_at: number;
};

// *********************** FORM L *********************
export type FormlItem = {
  pkt: string;
  badan_pembantu: string;
  biaya: BiayaItem;
  keberhasilan: string;
  kendala: string;
  lampiran: Array<string>;
  nama_program: string;
  nomor_program: string;
  pelaksana: string;
  pelaksanaan_kegiatan: string;
  sumber_dana: SumberDana;
  tempat: string;
  tujuan: string;
  usulan: string;
  waktu: string;
} & RequestData &
  ApprovalData;

export type SelectedForml = FormlItem & { key: string };

export type ListFormlItem = Array<SelectedForml>;
export interface FormlStates extends FormModule<FormlKeys> {
  list: ListFormlItem;
}

// *************** FORM P *********************
export type FormpItem = {
  pkt: string;
  badan_pembantu: string;
  bentuk_kegiatan: string;
  biaya: BiayaItem;
  lampiran: Array<string>;
  nama_program: string;
  nomor_program: string;
  pelaksana: string;
  pihak_luar: string;
  sasaran_kuantitas: string;
  sumber_dana: SumberDana;
  tempat: string;
  tujuan: string;
  ukuran_hasil: string;
  waktu: string;
} & RequestData &
  ApprovalData;

export type SelectedFormp = FormpItem & { key: string };

export type ListFormpItem = Array<SelectedFormp>;
export interface FormpStates extends FormModule<FormpKeys> {
  list: ListFormpItem;
}

// ************************ PKT **************************

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

export type SelectedPkt = PktItem & Choice;

export type ListPktItem = Array<PktItem & Choice>;
export interface PktStates extends FormModule<PktKeys> {
  list: ListPktItem;
}

export interface AuthStates {
  isLogin: boolean;
  name: string;
  email: string;
  group: string;
}
export interface RootStateStore {
  master: null | string;
}

export interface RootStateStoreWithModule {
  master: null | string;
  pkt: PktStates;
  formp: FormpStates;
  forml: FormlStates;
  auth: AuthStates;
}

/**** END STORE TYPE *****/

export interface FormQueryParams {
  action?: 'add' | 'edit';
  key?: string;
}
