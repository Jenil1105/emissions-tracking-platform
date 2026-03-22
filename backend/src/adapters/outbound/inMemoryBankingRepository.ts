import type { BankEntry } from "../../core/domain/BankEntry";
import type { BankingRepository } from "../../core/ports/bankingRepository";
import { bankEntries } from "../../data/bankEntries";

export class InMemoryBankingRepository implements BankingRepository {
  getRecords(shipId: string, year: number): BankEntry[] {
    return bankEntries.filter((entry) => entry.shipId === shipId && entry.year === year);
  }

  create(shipId: string, year: number, amount: number, type: "BANK" | "APPLY"): BankEntry {
    const record: BankEntry = {
      id: bankEntries.length + 1,
      shipId,
      year,
      amount,
      type,
    };

    bankEntries.push(record);
    return record;
  }
}
