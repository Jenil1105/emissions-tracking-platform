"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryBankingRepository = void 0;
const bankEntries_1 = require("../../data/bankEntries");
class InMemoryBankingRepository {
    getRecords(shipId, year) {
        return bankEntries_1.bankEntries.filter((entry) => entry.shipId === shipId && entry.year === year);
    }
    create(shipId, year, amount, type) {
        const record = {
            id: bankEntries_1.bankEntries.length + 1,
            shipId,
            year,
            amount,
            type,
        };
        bankEntries_1.bankEntries.push(record);
        return record;
    }
}
exports.InMemoryBankingRepository = InMemoryBankingRepository;
