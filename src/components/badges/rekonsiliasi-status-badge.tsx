import clsx from "clsx";

export type RekonsiliasiStatus = "matched" | "unmatched" | null;

type StatusBadgeProps = {
  status: RekonsiliasiStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
        -
      </span>
    );
  }

  const isMatched = status === "matched";

  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        isMatched
          ? "bg-emerald-100 text-emerald-700"
          : "bg-red-100 text-red-700"
      )}
    >
      {status}
    </span>
  );
}
