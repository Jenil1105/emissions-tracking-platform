import type { Pool } from "pg";
import type { Pool as FuelPool, PoolMember } from "../../core/domain/Pool";
import type { PoolRepository } from "../../core/ports/poolRepository";

export class PostgresPoolRepository implements PoolRepository {
  constructor(private readonly db: Pool) {}

  async create(year: number, members: PoolMember[]): Promise<FuelPool> {
    const client = await this.db.connect();

    try {
      await client.query("BEGIN");
      const poolResult = await client.query<{ id: number }>(
        `
          INSERT INTO pools (year)
          VALUES ($1)
          RETURNING id
        `,
        [year]
      );

      const poolId = poolResult.rows[0].id;

      for (const member of members) {
        await client.query(
          `
            INSERT INTO pool_members (pool_id, route_id, cb_before, cb_after)
            VALUES ($1, $2, $3, $4)
          `,
          [poolId, member.routeId, member.cbBefore, member.cbAfter]
        );
      }

      await client.query("COMMIT");

      return {
        id: poolId,
        year,
        members,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
