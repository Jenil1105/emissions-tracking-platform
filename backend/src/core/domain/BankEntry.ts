export type BankEntry = {
  id: number;
  year: number;
  amount: number;
  type: "BANK" | "APPLY";
};
