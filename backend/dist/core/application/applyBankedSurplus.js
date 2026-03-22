"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyBankedSurplus = void 0;
class ApplyBankedSurplus {
    bankingRepository;
    constructor(bankingRepository) {
        this.bankingRepository = bankingRepository;
    }
    execute(shipId, year, amount) {
        const records = this.bankingRepository.getRecords(shipId, year);
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
        const record = this.bankingRepository.create(shipId, year, amount, "APPLY");
        return {
            shipId,
            year,
            record,
            applied: amount,
            remainingBanked: availableBanked - amount,
        };
    }
}
exports.ApplyBankedSurplus = ApplyBankedSurplus;
