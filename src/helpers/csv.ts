import Papa from 'papaparse';
import { BiayaItem, PktItem, SumberDana } from '@/types';

const ROW = {
  BADAN_PEMBANTU: 0,
  NOMOR_PROGRAM: 1,
  NAMA_PROGRAM: 2,
  ACUAN: 3,
  SASARAN_KUANTITAS: 4,
  TUJUAN: 5,
  UKURAN_HASIL: 6,
  BENTUK_KEGIATAN: 7,
  WAKTU: 8,
  TEMPAT: 9,
  BIAYA: 10,
  BIAYA_COUNT: 11,
  BIAYA_FREQUENCY: 12,
  BIAYA_PRICE: 13,
  SUMBER_DANA: 14,
  PELAKSANA: 15,
  KETERANGAN: 16,
};
export const parseCSV = (files: FileList | null, onSuccess: (pkts: { [key in string]: PktItem[] }) => void) => {
  if (files?.length) {
    try {
      Papa.parse(files[0], {
        complete(res) {
          const pkts: { [key: string]: PktItem[] } = {};
          (res.data as string[][]).forEach((row, index, arr) => {
            if (index === 0) return;
            if (row[0].trim()) {
              const pktObj: PktItem = {
                acuan: '',
                badan_pembantu: '',
                bentuk_kegiatan: '',
                biaya: {},
                keterangan: '',
                nama_program: '',
                nomor_program: '',
                pelaksana: '',
                sasaran_kuantitas: '',
                sumber_dana: { a: 0, b: 0, c: 0 },
                tempat: '',
                tujuan: '',
                ukuran_hasil: '',
                waktu: '',
              };
              pktObj.badan_pembantu = row[ROW.BADAN_PEMBANTU];
              pktObj.nomor_program = row[ROW.NOMOR_PROGRAM];
              pktObj.nama_program = row[ROW.NAMA_PROGRAM];
              pktObj.acuan = row[ROW.ACUAN];
              pktObj.sasaran_kuantitas = row[ROW.SASARAN_KUANTITAS];
              pktObj.tujuan = row[ROW.TUJUAN];
              pktObj.ukuran_hasil = row[ROW.UKURAN_HASIL];
              pktObj.bentuk_kegiatan = row[ROW.BENTUK_KEGIATAN];
              pktObj.waktu = row[ROW.WAKTU];
              pktObj.tempat = row[ROW.TEMPAT];
              pktObj.pelaksana = row[ROW.PELAKSANA];
              pktObj.keterangan = row[ROW.KETERANGAN];

              // parsing biaya
              const biayaItem: BiayaItem = {};
              let i = 0;
              const getBiaya = (x: number) => {
                biayaItem[i] = {
                  name: arr[x][ROW.BIAYA],
                  count: parseInt(arr[x][ROW.BIAYA_COUNT]),
                  frequency: parseInt(arr[x][ROW.BIAYA_FREQUENCY]),
                  price: parseInt(arr[x][ROW.BIAYA_PRICE]),
                };
                if (arr[x + 1] && arr[x + 1][ROW.TEMPAT] === '') {
                  i++;
                  getBiaya(x + 1);
                }
                return biayaItem;
              };
              pktObj.biaya = getBiaya(index);

              // parsing sumber dana
              const sumberDana: SumberDana = { a: 0, b: 0, c: 0 };
              const mappingSumberDanaKey: { 0: 'a'; 1: 'b'; 2: 'c' } = { 0: 'a', 1: 'b', 2: 'c' };
              let j: 0 | 1 | 2 = 0;
              const getSumberDana = (x: number) => {
                const key = mappingSumberDanaKey[j];
                sumberDana[key] = parseInt(arr[x][ROW.SUMBER_DANA]);
                if (arr[x + 1] && arr[x + 1][ROW.BADAN_PEMBANTU] === '') {
                  j++;
                  getSumberDana(x + 1);
                }
                return sumberDana;
              };
              pktObj.sumber_dana = getSumberDana(index);

              // insert single pkt to main object
              const pktGroup = row[0].trim().toLowerCase();
              if (!pkts[row[0].trim()]) pkts[pktGroup] = [];
              pkts[pktGroup].push(pktObj);
            } else {
              return;
            }
          });
          onSuccess(pkts);
        },
      });
    } catch (error) {
      console.error(error);
      alert('Error ketika import, silakan cek file pkt anda');
    }
  }
};
