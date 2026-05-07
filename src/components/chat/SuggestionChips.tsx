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
          className="text-xs px-3 py-1.5 rounded-full border border-foreground/10 text-foreground/60 hover:border-foreground/30 hover:text-foreground transition-colors disabled:opacity-30"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
