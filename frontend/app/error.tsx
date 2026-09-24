"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";

function isConnectionError(error: Error): boolean {
  const message = error.message?.toLowerCase() || "";
  return (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("connection") ||
    message.includes("unreachable") ||
    message.includes("failed to fetch") ||
    message.includes("econnrefused") ||
    message.includes("etimedout") ||
    message.includes("ENOTFOUND") ||
    message.includes("aborted")
  );
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  const isServerDown = isConnectionError(error);
  const [errorId] = useState(() => error.digest || Math.random().toString(36).substring(2, 15));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center shadow-lg">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
          {isServerDown ? (
            <WifiOff className="w-8 h-8 text-red-600 dark:text-red-400" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          )}
        </div>

        <h1 className="text-xl font-black text-gray-900 dark:text-white mb-2">
          {isServerDown ? "Can't connect to the server" : "Something went wrong"}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          {isServerDown
            ? "Please check your internet connection and try again. The server may be temporarily unavailable."
            : error.message || "Please try again or contact us if the problem continues."}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors"
        >
          <RefreshCw size={16} />
          Try again
        </button>

        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
          Error ID: {errorId}
        </p>
      </div>
    </div>
  );
}
