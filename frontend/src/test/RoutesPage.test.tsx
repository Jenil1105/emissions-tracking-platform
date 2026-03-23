import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import RoutesPage from "../adapters/ui/components/RoutesPage";
import { routesFixture } from "./fixtures";

describe("RoutesPage", () => {
  it("renders routes and triggers baseline selection for non-baseline rows", async () => {
    const onSetBaseline = vi.fn();
    const user = userEvent.setup();

    render(
      <RoutesPage
        routes={routesFixture}
        loading={false}
        error=""
        vesselType=""
        fuelType=""
        year=""
        onVesselTypeChange={vi.fn()}
        onFuelTypeChange={vi.fn()}
        onYearChange={vi.fn()}
        onSetBaseline={onSetBaseline}
      />
    );

    expect(screen.getByText("R001")).toBeInTheDocument();
    expect(screen.getByText("SHIP-002")).toBeInTheDocument();
    expect(screen.getByText("Current baseline")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /set baseline/i })[0]!);

    expect(onSetBaseline).toHaveBeenCalledWith("R002");
  });
});
