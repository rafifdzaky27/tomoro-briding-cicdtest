// src/types/bukuBank.ts
export type BukuBankRow = {
  id: number;
  bank_record: string | null;
  keterangan: string | null;
  cabang: string | null;
  nominal: number | null;
  cr_db: string | null;
  saldo: number | null;
  date: string | null;
  diterima_dibayar: string | null;
};

export type CrDbDistribution = {
  cr_db: string | null;
  total_nominal: number;
};

export type BukuBankSummaryResponse = {
  distribusi_nominal_by_cr_db: CrDbDistribution[];
  saldo_akhir: number | null;
  jumlah_transaksi: number;
  total_debit: number;
  total_kredit: number;
  profit: number;
  data: BukuBankRow[];
};