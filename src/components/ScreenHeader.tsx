import type { ReactNode } from "react";

type Props = {
  title: string;
  right?: ReactNode;
};

export function ScreenHeader({ title, right }: Props) {
  return (
    <div className="flex items-center justify-between px-4 pt-5 pb-4">
      <h2 className="display-heading text-xl text-ink">{title}</h2>
      {right}
    </div>
  );
}
