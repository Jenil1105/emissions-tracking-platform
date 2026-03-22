import type { Pool, PoolMember } from "../../core/domain/Pool";
import type { PoolRepository } from "../../core/ports/poolRepository";
import { pools } from "../../data/pools";

export class InMemoryPoolRepository implements PoolRepository {
  create(year: number, members: PoolMember[]): Pool {
    const pool: Pool = {
      id: pools.length + 1,
      year,
      members,
    };

    pools.push(pool);
    return pool;
  }
}
