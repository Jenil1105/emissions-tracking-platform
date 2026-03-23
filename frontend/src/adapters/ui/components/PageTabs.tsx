type PageTabsProps = {
  activePage: "routes" | "compare" | "banking" | "pooling";
  onPageChange: (page: "routes" | "compare" | "banking" | "pooling") => void;
};

const tabs = [
  { id: "routes", label: "Routes" },
  { id: "compare", label: "Compare" },
  { id: "banking", label: "Banking" },
  { id: "pooling", label: "Pooling" },
] as const;

function PageTabs({ activePage, onPageChange }: PageTabsProps) {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-full border border-slate-200 bg-white/90 p-1.5 shadow-sm backdrop-blur">
      {tabs.map((tab) => {
        const isActive = activePage === tab.id;

        return (
          <button
            key={tab.id}
            className={[
              "rounded-full px-3 py-1.5 text-sm font-semibold transition md:px-4 md:py-2",
              isActive
                ? "bg-[#0f766e] text-white shadow-[0_10px_24px_rgba(15,118,110,0.22)]"
                : "text-slate-600 hover:bg-[#eff8f7] hover:text-slate-900",
            ].join(" ")}
            disabled={isActive}
            onClick={() => onPageChange(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default PageTabs;
