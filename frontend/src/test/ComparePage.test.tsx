import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ComparePage from "../adapters/ui/components/ComparePage";
import { comparisonFixture } from "./fixtures";

vi.mock("recharts", () => ({
  Bar: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => <div />,
  Cell: () => <div />,
  ReferenceLine: () => <div />,
  ResponsiveContainer: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Tooltip: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
}));

describe("ComparePage", () => {
  it("renders comparison rows and compliance indicators", () => {
    render(<ComparePage comparisonData={comparisonFixture} loading={false} error="" />);

    expect(screen.getByText("Baseline route")).toBeInTheDocument();
    expect(screen.getByText("R001")).toBeInTheDocument();
    expect(screen.getByText("R002")).toBeInTheDocument();
    expect(screen.getByText("R003")).toBeInTheDocument();
    expect(screen.getAllByText("Yes").length).toBeGreaterThan(0);
    expect(screen.getAllByText("No").length).toBeGreaterThan(0);
  });
});
