type Option = { value: string; label: string };

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
};

export function SegmentedControl({ options, value, onChange }: Props) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-border">
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`label !text-[11px] px-3 py-1.5 transition ${
              active ? "bg-ink text-bg" : "bg-surface text-muted"
            } ${i > 0 ? "border-l border-border" : ""}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
