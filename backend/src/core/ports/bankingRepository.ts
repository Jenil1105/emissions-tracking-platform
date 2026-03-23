import type { BankEntry } from "../domain/BankEntry";

export interface BankingRepository {
  getRecords(): Promise<BankEntry[]>;
  create(year: number, amount: number, type: "BANK" | "APPLY"): Promise<BankEntry>;
}
