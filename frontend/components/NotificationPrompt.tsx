"use client";

import { Bell, BellOff, Check, X, Loader2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useState, useEffect } from "react";

export default function NotificationPrompt() {
  const {
    isSupported,
    permission,
    subscription,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  } = useNotifications();

  const [isDismissed, setIsDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-dismiss success messages after 3 seconds
  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => setShowSuccess(false), 3000);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  // Check local storage for dismissal
  useEffect(() => {
    const dismissed = localStorage.getItem("poki-notifications-dismissed");
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  // Don't show if not supported or already dismissed or already subscribed
  if (!isSupported || isDismissed || subscription) return null;

  // Don't show if permission is already decided (granted or denied)
  if (permission === "denied" || permission === "granted") return null;

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      setShowSuccess(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("poki-notifications-dismissed", "true");
  };

  if (showSuccess) {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50">
        <div className="bg-green-600 text-white rounded-xl shadow-lg p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Check size={16} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Notifications enabled!</p>
            <p className="text-xs text-green-100">
              You&apos;ll get alerts for new articles &amp; story episodes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <Bell size={18} className="text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  Get instant alerts
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Stay informed with notifications for new articles &amp; story episodes.
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 -mr-1 -mt-1"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-500 mt-2">{error}</p>
            )}

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-semibold py-2 px-4 rounded-full transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Enabling...
                  </>
                ) : (
                  "Enable"
                )}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings toggle for managing notifications
export function NotificationSettings() {
  const {
    isSupported,
    permission,
    subscription,
    isLoading,
    subscribe,
    unsubscribe,
  } = useNotifications();

  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-dismiss success messages after 2 seconds
  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => setShowSuccess(false), 2000);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  if (!isSupported) {
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <BellOff size={20} className="text-gray-400" />
        <div>
          <p className="font-medium text-sm text-gray-700 dark:text-gray-300">
            Notifications not supported
          </p>
          <p className="text-xs text-gray-500">
            Your browser doesn&apos;t support push notifications.
          </p>
        </div>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <BellOff size={20} className="text-yellow-600 dark:text-yellow-400" />
        <div>
          <p className="font-medium text-sm text-gray-700 dark:text-gray-300">
            Notifications blocked
          </p>
          <p className="text-xs text-gray-500">
            Please enable notifications in your browser settings.
          </p>
        </div>
      </div>
    );
  }

  const handleToggle = async () => {
    if (subscription) {
      await unsubscribe();
    } else {
      const success = await subscribe();
      if (success) {
        setShowSuccess(true);
      }
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-3">
        {subscription ? (
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Bell size={18} className="text-green-600 dark:text-green-400" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <BellOff size={18} className="text-gray-500 dark:text-gray-400" />
          </div>
        )}
        <div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">
            {subscription ? "Notifications enabled" : "Notifications disabled"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {subscription
              ? "You'll receive alerts for new articles & story episodes."
              : "Enable to get instant alerts for news and stories."}
          </p>
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          subscription ? "bg-red-600" : "bg-gray-300 dark:bg-gray-600"
        } disabled:opacity-50`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            subscription ? "translate-x-6" : "translate-x-1"
          }`}
        />
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={12} className="animate-spin text-white" />
          </span>
        )}
      </button>
      {showSuccess && (
        <div className="absolute right-0 -top-8 bg-green-600 text-white text-xs px-2 py-1 rounded">
          Saved!
        </div>
      )}
    </div>
  );
}
