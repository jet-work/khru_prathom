import clsx from "clsx";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import type { DisplayStatus } from "@/lib/types";

export default function StatusBadge({ status }: { status: DisplayStatus }) {
  return (
    <span
      className={clsx(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_COLORS[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
