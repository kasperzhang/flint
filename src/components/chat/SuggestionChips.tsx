"use client";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  disabled: boolean;
}

export function SuggestionChips({
  suggestions,
  onSelect,
  disabled,
}: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          className="rounded-[var(--r-pill)] border border-border bg-surface px-3.5 py-1.5 text-[12px] font-medium text-ink-2 transition-all duration-[var(--dur-fast)] hover:border-border-strong hover:-translate-y-px disabled:opacity-30"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
