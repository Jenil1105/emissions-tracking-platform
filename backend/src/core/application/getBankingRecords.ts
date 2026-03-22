import type { BankingRepository } from "../ports/bankingRepository";

export class GetBankingRecords {
  constructor(private readonly bankingRepository: BankingRepository) {}

  execute(shipId: string, year: number) {
    const records = this.bankingRepository.getRecords(shipId, year);
    const totalBanked = records.reduce((sum, record) => {
      return sum + (record.type === "BANK" ? record.amount : -record.amount);
    }, 0);

    return {
      records,
      totalBanked,
    };
  }
}
