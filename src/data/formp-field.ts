import { FormFields, FormpKeys } from '@/types';

const fields: FormFields<FormpKeys> = [
  {
    key: 'badan_pembantu',
    name: 'Badan Pembantu',
    type: 'input-text',
    fieldValue: 'FieldValueDefault',
    value: '',
  },
  {
    key: 'lampiran',
    name: 'Lampiran',
    type: 'file-uploader',
    fieldValue: 'FieldValueDefault',
    value: [],
  },
  {
    key: 'nomor_program',
    name: 'Nomor Program',
    type: 'input-text',
    fieldValue: 'FieldValueDefault',
    value: '',
  },
  {
    key: 'nama_program',
    name: 'Nama Program',
    type: 'input-text',
    fieldValue: 'FieldValueDefault',
    value: '',
  },
  {
    key: 'sasaran_kuantitas',
    name: 'Sasaran Kuantitas',
    fieldValue: 'FieldValueDefault',
    type: 'input-text',
    value: '',
  },
  {
    key: 'tujuan',
    name: 'Tujuan',
    fieldValue: 'FieldValueDefault',
    type: 'simple-editor',
    props: {
      formats: ['bold', 'italic', 'underline', 'list'],
    },
    value: '',
  },
  {
    key: 'ukuran_hasil',
    name: 'Ukuran Hasil',
    fieldValue: 'FieldValueDefault',
    type: 'text-area',
    value: '',
  },
  {
    key: 'waktu',
    name: 'Waktu',
    type: 'calendar-input',
    fieldValue: 'FieldValueDefault',
    props: {
      showIcon: true,
      dateFormat: 'dd-mm-yy',
      manualInput: false,
    },
    value: '',
    view: '',
  },
  {
    key: 'tempat',
    name: 'Tempat',
    type: 'input-text',
    fieldValue: 'FieldValueDefault',
    value: '',
  },
  {
    key: 'bentuk_kegiatan',
    name: 'Bentuk Kegiatan',
    fieldValue: 'FieldValueDefault',
    type: 'simple-editor',
    props: {
      formats: ['bold', 'italic', 'underline', 'list'],
    },
    value: '',
  },

  {
    key: 'pihak_luar',
    name: 'Pihak Luar',
    fieldValue: 'FieldValueDefault',
    type: 'input-text',
    value: '',
  },
  {
    key: 'biaya',
    name: 'Biaya',
    type: 'cost-input',
    fieldValue: 'FieldValueCost',
    value: [],
  },
  {
    key: 'sumber_dana',
    name: 'Sumber Dana',
    type: null,
    fieldValue: 'FieldValueDefault',
    children: [
      {
        key: 'a',
        name: 'Sumber A',
        type: 'input-number',
        props: { prefix: 'Rp ' },
        fieldValue: 'FieldValueSourceFund',
        value: 0,
      },
      {
        key: 'b',
        name: 'Sumber B',
        type: 'input-number',
        props: { prefix: 'Rp ' },
        fieldValue: 'FieldValueSourceFund',
        value: 0,
      },
      {
        key: 'c',
        name: 'Sumber C',
        type: 'input-number',
        props: { prefix: 'Rp ' },
        fieldValue: 'FieldValueSourceFund',
        value: 0,
      },
    ],
  },
  {
    key: 'pelaksana',
    name: 'Pelaksana',
    type: 'input-text',
    fieldValue: 'FieldValueDefault',
    value: '',
  },
];

export default fields;
