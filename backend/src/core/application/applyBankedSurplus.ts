import type { BankingRepository } from "../ports/bankingRepository";

export class ApplyBankedSurplus {
  constructor(private readonly bankingRepository: BankingRepository) {}

  async execute(shipId: string, year: number, amount: number) {
    const globalRecords = await this.bankingRepository.getRecords();
    const banked = globalRecords
      .filter((record) => record.type === "BANK")
      .reduce((sum, record) => sum + record.amount, 0);
    const appliedAlready = globalRecords
      .filter((record) => record.type === "APPLY")
      .reduce((sum, record) => sum + record.amount, 0);
    const availableBanked = banked - appliedAlready;

    if (amount <= 0) {
      return { error: "Amount must be greater than zero" };
    }

    if (amount > availableBanked) {
      return { error: "Amount exceeds available banked surplus" };
    }

    const record = await this.bankingRepository.create(shipId, year, amount, "APPLY");

    return {
      shipId,
      year,
      record,
      applied: amount,
      remainingBanked: availableBanked - amount,
    };
  }
}
