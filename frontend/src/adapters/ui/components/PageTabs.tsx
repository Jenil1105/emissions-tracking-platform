type PageTabsProps = {
  activePage: "routes" | "compare" | "banking";
  onPageChange: (page: "routes" | "compare" | "banking") => void;
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
      <button disabled={activePage === "banking"} onClick={() => onPageChange("banking")}>
        Banking
      </button>
    </div>
  );
}

export default PageTabs;
