import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PoolingPage from "../adapters/ui/components/PoolingPage";
import { adjustedBalancesFixture, routesFixture } from "./fixtures";

describe("PoolingPage", () => {
  it("disables invalid pool creation and enables it when the selected pool is non-negative", async () => {
    const onCreatePool = vi.fn();
    const onShipToggle = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <PoolingPage
        routes={routesFixture}
        selectedYear="2024"
        adjustedBalances={adjustedBalancesFixture}
        selectedMembers={[adjustedBalancesFixture[0]!]}
        selectedShipIds={["SHIP-001"]}
        poolResult={null}
        loading={false}
        error=""
        onYearChange={vi.fn()}
        onShipToggle={onShipToggle}
        onCreatePool={onCreatePool}
      />
    );

    expect(screen.getByRole("button", { name: /create pool/i })).toBeDisabled();

    await user.click(screen.getAllByRole("checkbox")[0]!);
    expect(onShipToggle).toHaveBeenCalledWith("SHIP-001");

    rerender(
      <PoolingPage
        routes={routesFixture}
        selectedYear="2024"
        adjustedBalances={adjustedBalancesFixture}
        selectedMembers={adjustedBalancesFixture}
        selectedShipIds={["SHIP-001", "SHIP-002"]}
        poolResult={null}
        loading={false}
        error=""
        onYearChange={vi.fn()}
        onShipToggle={onShipToggle}
        onCreatePool={onCreatePool}
      />
    );

    const createButton = screen.getByRole("button", { name: /create pool/i });
    expect(createButton).toBeEnabled();

    await user.click(createButton);
    expect(onCreatePool).toHaveBeenCalled();
  });
});
