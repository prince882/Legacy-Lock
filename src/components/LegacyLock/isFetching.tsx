
import { useIsFetching } from "@tanstack/react-query";
import React from "react";

export function GlobalLoadingIndicator({ children }: { children: React.ReactNode }) {
  const isFetching = useIsFetching(); // number of active queries being fetched
  if (isFetching !== 0) {
    return (
      <div className="fixed top-0 left-0 w-full bg-black/70 text-white text-center p-2 z-50">
        🔄 Refreshing data...
      </div>
    );
  }

  return children;
}
