import clsx from "clsx";

export type StatusFilter = "all" | "matched" | "unmatched";

type FilterBarProps = {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
};

export function RekonsiliasiFilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-xs">
      <FilterButton
        label="Semua"
        active={value === "all"}
        onClick={() => onChange("all")}
      />
      <FilterButton
        label="Matched"
        active={value === "matched"}
        onClick={() => onChange("matched")}
      />
      <FilterButton
        label="Unmatched"
        active={value === "unmatched"}
        onClick={() => onChange("unmatched")}
      />
    </div>
  );
}

type FilterButtonProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function FilterButton({ label, active, onClick }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-md px-3 py-1 font-medium transition",
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100"
      )}
    >
      {label}
    </button>
  );
}