import React from "react";
import { Inbox } from "lucide-react";

export function EmptyState({ message = "No data for the current filters." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <Inbox className="h-8 w-8 text-foreground-quaternary" />
      <p className="text-sm text-foreground-tertiary">{message}</p>
    </div>
  );
}
