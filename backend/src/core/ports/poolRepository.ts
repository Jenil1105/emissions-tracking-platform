import type { Pool, PoolMember } from "../domain/Pool";

export interface PoolRepository {
  create(year: number, members: PoolMember[]): Pool;
}
