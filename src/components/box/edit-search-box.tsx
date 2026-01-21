// src/components/edit-value/edit-search-box.tsx
type EditSearchBoxProps = {
  query: string;
  onQueryChange: (value: string) => void;
  loading: boolean;
  onSearch: () => void;
  placeholder?: string;
  helperText?: string;
};

export function EditSearchBox({
  query,
  onQueryChange,
  loading,
  onSearch,
  placeholder = "ketik kata kunci...",
  helperText = "Multi-kata, setiap kata akan dicari di kolom keterangan.",
}: EditSearchBoxProps) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSearch();
          }
        }}
        className="w-full rounded-md border px-3 py-2 text-sm"
      />
      <button
        type="button"
        onClick={onSearch}
        disabled={loading}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Searching..." : "Search"}
      </button>
      <p className="text-[11px] text-slate-500">{helperText}</p>
    </div>
  );
}
