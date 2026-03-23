"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBankingRecords = void 0;
class GetBankingRecords {
    bankingRepository;
    constructor(bankingRepository) {
        this.bankingRepository = bankingRepository;
    }
    async execute(shipId, year) {
        const records = await this.bankingRepository.getRecords(shipId, year);
        const allRecords = await this.bankingRepository.getRecords();
        const banked = records
            .filter((record) => record.type === "BANK")
            .reduce((sum, record) => sum + record.amount, 0);
        const applied = records
            .filter((record) => record.type === "APPLY")
            .reduce((sum, record) => sum + record.amount, 0);
        const globalBanked = allRecords
            .filter((record) => record.type === "BANK")
            .reduce((sum, record) => sum + record.amount, 0);
        const globalApplied = allRecords
            .filter((record) => record.type === "APPLY")
            .reduce((sum, record) => sum + record.amount, 0);
        return {
            shipId,
            year,
            records,
            banked,
            applied,
            totalBanked: globalBanked - globalApplied,
        };
    }
}
exports.GetBankingRecords = GetBankingRecords;
