const MOOD_OPTIONS = [
  { score: 1, emoji: "😫", label: "Terrible" },
  { score: 2, emoji: "😔", label: "Down" },
  { score: 3, emoji: "😐", label: "Neutral" },
  { score: 4, emoji: "🙂", label: "Good" },
  { score: 5, emoji: "😄", label: "Great" },
];

function MoodSelector({ value, onChange, size = "md" }) {
  const isCompact = size === "sm";

  return (
    <div
      className="grid grid-cols-5 gap-1 sm:gap-2 w-full max-w-full"
      role="group"
      aria-label="Select mood"
    >
      {MOOD_OPTIONS.map(({ score, emoji, label }) => {
        const selected = value === score;
        return (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            aria-pressed={selected}
            className={`flex min-w-0 flex-col items-center justify-center gap-0.5 sm:gap-1.5 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
              isCompact ? "p-1.5 sm:p-3" : "p-2 sm:p-4"
            } ${
              selected
                ? "border-primary bg-primary/10 scale-[1.02] shadow-md ring-2 ring-primary/30"
                : "border-transparent bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700"
            }`}
          >
            <span
              className={`leading-none ${
                isCompact
                  ? "text-2xl sm:text-3xl"
                  : "text-3xl sm:text-4xl md:text-5xl"
              } ${selected ? "animate-bounce-subtle" : ""}`}
            >
              {emoji}
            </span>
            <span
              className={`w-full truncate text-center font-bold uppercase tracking-tight ${
                isCompact ? "text-[8px] sm:text-[10px]" : "text-[9px] sm:text-xs"
              } ${selected ? "text-primary" : "text-slate-400"}`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default MoodSelector;
