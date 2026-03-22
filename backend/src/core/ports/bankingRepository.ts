import type { BankEntry } from "../domain/BankEntry";

export interface BankingRepository {
  getRecords(shipId: string, year: number): BankEntry[];
  create(shipId: string, year: number, amount: number, type: "BANK" | "APPLY"): BankEntry;
}
