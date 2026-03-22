import type { BankingRepository } from "../ports/bankingRepository";

export class GetBankingRecords {
  constructor(private readonly bankingRepository: BankingRepository) {}

  execute(shipId: string, year: number) {
    const records = this.bankingRepository.getRecords(shipId, year);
    const banked = records
      .filter((record) => record.type === "BANK")
      .reduce((sum, record) => sum + record.amount, 0);
    const applied = records
      .filter((record) => record.type === "APPLY")
      .reduce((sum, record) => sum + record.amount, 0);

    return {
      shipId,
      year,
      records,
      banked,
      applied,
      totalBanked: banked - applied,
    };
  }
}
