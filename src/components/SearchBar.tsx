import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

type Props = {
  onSearch: (query: string) => void;
  isLoading: boolean;
};

export function SearchBar({ onSearch, isLoading }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        inputMode="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. Dyson V8 vacuum, used"
        className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base
          shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="flex items-center justify-center rounded-xl bg-teal-600 px-4 py-3 text-white
          shadow-sm transition active:scale-95 disabled:opacity-50"
        aria-label="Search"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Search className="h-5 w-5" />
        )}
      </button>
    </form>
  );
}
