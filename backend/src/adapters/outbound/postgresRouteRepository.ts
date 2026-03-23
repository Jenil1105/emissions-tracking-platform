import type { Pool } from "pg";
import type { Route } from "../../core/domain/Route";
import type { RouteFilters, RouteRepository } from "../../core/ports/routeRepository";

type RouteRow = {
  id: number;
  route_id: string;
  vessel_type: string;
  fuel_type: string;
  year: number;
  ghg_intensity: number;
  fuel_consumption: number;
  distance: number;
  total_emissions: number;
  is_baseline: boolean;
};

function mapRoute(row: RouteRow): Route {
  return {
    id: row.id,
    routeId: row.route_id,
    vesselType: row.vessel_type,
    fuelType: row.fuel_type,
    year: row.year,
    ghgIntensity: row.ghg_intensity,
    fuelConsumption: row.fuel_consumption,
    distance: row.distance,
    totalEmissions: row.total_emissions,
    isBaseline: row.is_baseline,
  };
}

export class PostgresRouteRepository implements RouteRepository {
  constructor(private readonly db: Pool) {}

  async getAll(filters?: RouteFilters): Promise<Route[]> {
    const conditions: string[] = [];
    const values: Array<string | number> = [];

    if (filters?.vesselType) {
      values.push(filters.vesselType);
      conditions.push(`vessel_type = $${values.length}`);
    }

    if (filters?.fuelType) {
      values.push(filters.fuelType);
      conditions.push(`fuel_type = $${values.length}`);
    }

    if (filters?.year) {
      values.push(filters.year);
      conditions.push(`year = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await this.db.query<RouteRow>(
      `
        SELECT id, route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline
        FROM routes
        ${whereClause}
        ORDER BY id ASC
      `,
      values
    );

    return result.rows.map(mapRoute);
  }

  async setBaseline(routeId: string): Promise<Route | undefined> {
    const client = await this.db.connect();

    try {
      await client.query("BEGIN");
      const selected = await client.query<RouteRow>(
        `
          SELECT id, route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline
          FROM routes
          WHERE route_id = $1
        `,
        [routeId]
      );

      if (selected.rows.length === 0) {
        await client.query("ROLLBACK");
        return undefined;
      }

      await client.query(`UPDATE routes SET is_baseline = FALSE`);
      await client.query(`UPDATE routes SET is_baseline = TRUE WHERE route_id = $1`, [routeId]);
      await client.query("COMMIT");

      return { ...mapRoute(selected.rows[0]), isBaseline: true };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getBaseline(): Promise<Route | undefined> {
    const result = await this.db.query<RouteRow>(
      `
        SELECT id, route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline
        FROM routes
        WHERE is_baseline = TRUE
        LIMIT 1
      `
    );

    if (result.rows.length === 0) {
      return undefined;
    }

    return mapRoute(result.rows[0]);
  }

  async getByYear(year: number): Promise<Route[]> {
    const result = await this.db.query<RouteRow>(
      `
        SELECT id, route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline
        FROM routes
        WHERE year = $1
        ORDER BY id ASC
      `,
      [year]
    );

    return result.rows.map(mapRoute);
  }
}
