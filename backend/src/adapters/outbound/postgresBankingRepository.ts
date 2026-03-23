import type { Pool } from "pg";
import type { BankEntry } from "../../core/domain/BankEntry";
import type { BankingRepository } from "../../core/ports/bankingRepository";

type BankEntryRow = {
  id: number;
  ship_id: string;
  year: number;
  amount: number;
  type: "BANK" | "APPLY";
};

function mapBankEntry(row: BankEntryRow): BankEntry {
  return {
    id: row.id,
    shipId: row.ship_id,
    year: row.year,
    amount: row.amount,
    type: row.type,
  };
}

export class PostgresBankingRepository implements BankingRepository {
  constructor(private readonly db: Pool) {}

  async getRecords(shipId?: string, year?: number): Promise<BankEntry[]> {
    const conditions: string[] = [];
    const values: Array<string | number> = [];

    if (shipId) {
      values.push(shipId);
      conditions.push(`ship_id = $${values.length}`);
    }

    if (year !== undefined) {
      values.push(year);
      conditions.push(`year = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await this.db.query<BankEntryRow>(
      `
        SELECT id, ship_id, year, amount, type
        FROM bank_entries
        ${whereClause}
        ORDER BY id ASC
      `,
      values
    );

    return result.rows.map(mapBankEntry);
  }

  async create(shipId: string, year: number, amount: number, type: "BANK" | "APPLY"): Promise<BankEntry> {
    const result = await this.db.query<BankEntryRow>(
      `
        INSERT INTO bank_entries (ship_id, year, amount, type)
        VALUES ($1, $2, $3, $4)
        RETURNING id, ship_id, year, amount, type
      `,
      [shipId, year, amount, type]
    );

    return mapBankEntry(result.rows[0]);
  }
}
