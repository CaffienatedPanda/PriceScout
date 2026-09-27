type Props = {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
};

const TONE_TEXT: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-ink",
  positive: "text-accent",
  negative: "text-danger",
};

export function StatTile({ label, value, tone = "default" }: Props) {
  return (
    <div className="rounded-lg border border-border border-l-2 border-l-accent bg-surface p-3">
      <p className="label">{label}</p>
      <p className={`mt-1 font-mono text-lg font-semibold ${TONE_TEXT[tone]}`}>{value}</p>
    </div>
  );
}
