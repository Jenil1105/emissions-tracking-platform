import type { ShipCompliance } from "../domain/ShipCompliance";

export interface ShipComplianceRepository {
  saveSnapshot(input: Omit<ShipCompliance, "id">): Promise<ShipCompliance>;
}
