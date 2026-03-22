"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryPoolRepository = void 0;
const pools_1 = require("../../data/pools");
class InMemoryPoolRepository {
    create(year, members) {
        const pool = {
            id: pools_1.pools.length + 1,
            year,
            members,
        };
        pools_1.pools.push(pool);
        return pool;
    }
}
exports.InMemoryPoolRepository = InMemoryPoolRepository;
