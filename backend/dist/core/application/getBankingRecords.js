"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBankingRecords = void 0;
class GetBankingRecords {
    bankingRepository;
    constructor(bankingRepository) {
        this.bankingRepository = bankingRepository;
    }
    execute(shipId, year) {
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
exports.GetBankingRecords = GetBankingRecords;
