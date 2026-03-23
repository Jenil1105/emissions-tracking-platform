import type { BankingRepository } from "../ports/bankingRepository";

export class GetBankingRecords {
  constructor(private readonly bankingRepository: BankingRepository) {}

  async execute(year?: number) {
    const records = await this.bankingRepository.getRecords();
    const banked = records
      .filter((record) => record.type === "BANK")
      .reduce((sum, record) => sum + record.amount, 0);
    const applied = records
      .filter((record) => record.type === "APPLY")
      .reduce((sum, record) => sum + record.amount, 0);

    return {
      year: year ?? 0,
      records,
      banked,
      applied,
      totalBanked: banked - applied,
    };
  }
}
