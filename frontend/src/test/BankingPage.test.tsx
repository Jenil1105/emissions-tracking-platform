import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import BankingPage from "../adapters/ui/components/BankingPage";
import { bankingRecordsFixture, complianceBalanceFixture, routesFixture } from "./fixtures";

describe("BankingPage", () => {
  it("shows ship KPIs and allows applying banked surplus when the ship is in deficit", async () => {
    const onApply = vi.fn();
    const onApplyAmountChange = vi.fn();
    const user = userEvent.setup();

    render(
      <BankingPage
        routes={routesFixture}
        selectedYear="2024"
        selectedShipId="SHIP-003"
        complianceBalance={complianceBalanceFixture}
        bankingRecords={bankingRecordsFixture}
        loading={false}
        error=""
        bankAmount=""
        applyAmount="10000"
        onYearChange={vi.fn()}
        onShipChange={vi.fn()}
        onBankAmountChange={vi.fn()}
        onApplyAmountChange={onApplyAmountChange}
        onBank={vi.fn()}
        onApply={onApply}
      />
    );

    expect(screen.getByText("Ship / year")).toBeInTheDocument();
    expect(screen.getByText("Available global banked balance")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /bank surplus/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /apply balance/i })).toBeEnabled();

    await user.clear(screen.getByPlaceholderText("Apply amount"));
    await user.type(screen.getByPlaceholderText("Apply amount"), "25000");
    await user.click(screen.getByRole("button", { name: /apply balance/i }));

    expect(onApplyAmountChange).toHaveBeenCalled();
    expect(onApply).toHaveBeenCalled();
  });
});
