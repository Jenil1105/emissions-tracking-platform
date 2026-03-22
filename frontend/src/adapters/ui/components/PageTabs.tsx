type PageTabsProps = {
  activePage: "routes" | "compare";
  onPageChange: (page: "routes" | "compare") => void;
};

function PageTabs({ activePage, onPageChange }: PageTabsProps) {
  return (
    <div style={{ marginBottom: "20px", display: "flex", gap: "12px" }}>
      <button disabled={activePage === "routes"} onClick={() => onPageChange("routes")}>
        Routes
      </button>
      <button disabled={activePage === "compare"} onClick={() => onPageChange("compare")}>
        Compare
      </button>
    </div>
  );
}

export default PageTabs;
