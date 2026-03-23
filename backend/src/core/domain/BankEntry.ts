export type BankEntry = {
  id: number;
  shipId: string;
  year: number;
  amount: number;
  type: "BANK" | "APPLY";
};
