interface IBalanceBankDetailAdmin {
  email: string;
  banks: {
    saldo: number;
    id: string;
    email: string;
    nama: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  total_saldo: number;
}

export type { IBalanceBankDetailAdmin };
