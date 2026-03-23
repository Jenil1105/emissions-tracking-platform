import type { Pool } from "pg";
import type { ShipCompliance } from "../../core/domain/ShipCompliance";
import type { ShipComplianceRepository } from "../../core/ports/shipComplianceRepository";

type ShipComplianceRow = {
  id: number;
  ship_id: string;
  year: number;
  cb_gco2eq: number;
  ghg_intensity: number;
  energy_in_scope: number;
};

function mapSnapshot(row: ShipComplianceRow): ShipCompliance {
  return {
    id: row.id,
    shipId: row.ship_id,
    year: row.year,
    cbGco2eq: row.cb_gco2eq,
    ghgIntensity: row.ghg_intensity,
    energyInScope: row.energy_in_scope,
  };
}

export class PostgresShipComplianceRepository implements ShipComplianceRepository {
  constructor(private readonly db: Pool) {}

  async saveSnapshot(input: Omit<ShipCompliance, "id">): Promise<ShipCompliance> {
    const result = await this.db.query<ShipComplianceRow>(
      `
        INSERT INTO ship_compliance (ship_id, year, cb_gco2eq, ghg_intensity, energy_in_scope)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (ship_id, year) DO UPDATE
        SET cb_gco2eq = EXCLUDED.cb_gco2eq,
            ghg_intensity = EXCLUDED.ghg_intensity,
            energy_in_scope = EXCLUDED.energy_in_scope
        RETURNING id, ship_id, year, cb_gco2eq, ghg_intensity, energy_in_scope
      `,
      [input.shipId, input.year, input.cbGco2eq, input.ghgIntensity, input.energyInScope]
    );

    return mapSnapshot(result.rows[0]);
  }
}
