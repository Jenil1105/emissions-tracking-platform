import type { BankingRepository } from "../ports/bankingRepository";

export class ApplyBankedSurplus {
  constructor(private readonly bankingRepository: BankingRepository) {}

  async execute(year: number, amount: number) {
    const records = await this.bankingRepository.getRecords(year);
    const banked = records
      .filter((record) => record.type === "BANK")
      .reduce((sum, record) => sum + record.amount, 0);
    const appliedAlready = records
      .filter((record) => record.type === "APPLY")
      .reduce((sum, record) => sum + record.amount, 0);
    const availableBanked = banked - appliedAlready;

    if (amount <= 0) {
      return { error: "Amount must be greater than zero" };
    }

    if (amount > availableBanked) {
      return { error: "Amount exceeds available banked surplus" };
    }

    const record = await this.bankingRepository.create(year, amount, "APPLY");

    return {
      year,
      record,
      applied: amount,
      remainingBanked: availableBanked - amount,
    };
  }
}
