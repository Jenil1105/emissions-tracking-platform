import type { BankingRepository } from "../ports/bankingRepository";

export class ApplyBankedSurplus {
  constructor(private readonly bankingRepository: BankingRepository) {}

  execute(shipId: string, year: number, amount: number) {
    const records = this.bankingRepository.getRecords(shipId, year);
    const availableBanked = records.reduce((sum, record) => {
      return sum + (record.type === "BANK" ? record.amount : -record.amount);
    }, 0);

    if (amount <= 0) {
      return { error: "Amount must be greater than zero" };
    }

    if (amount > availableBanked) {
      return { error: "Amount exceeds available banked surplus" };
    }

    const record = this.bankingRepository.create(shipId, year, amount, "APPLY");

    return {
      record,
      applied: amount,
      remainingBanked: availableBanked - amount,
    };
  }
}
