"use client";

import { useState, useEffect, useCallback } from "react";

// Convert VAPID public key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface NotificationState {
  isSupported: boolean;
  permission: NotificationPermission | null;
  subscription: PushSubscription | null;
  isLoading: boolean;
  error: string | null;
}

interface UseNotificationsReturn extends NotificationState {
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  requestPermission: () => Promise<NotificationPermission | null>;
  checkSubscription: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [state, setState] = useState<NotificationState>({
    isSupported: false,
    permission: null,
    subscription: null,
    isLoading: false,
    error: null,
  });

  // Check if notifications are supported
  useEffect(() => {
    if (typeof window === "undefined") return;

    const supported =
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;

    setState((prev) => ({
      ...prev,
      isSupported: supported,
      permission: supported ? Notification.permission : null,
    }));

    if (supported) {
      checkSubscription();
    }
  }, []);

  // Check existing subscription
  const checkSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      setState((prev) => ({ ...prev, subscription: existingSubscription }));
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!state.isSupported) return null;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const permission = await Notification.requestPermission();
      setState((prev) => ({
        ...prev,
        permission,
        isLoading: false,
      }));
      return permission;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to request permission",
        isLoading: false,
      }));
      return null;
    }
  }, [state.isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState((prev) => ({ ...prev, error: "Notifications not supported" }));
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request permission first
      const permission = await requestPermission();
      if (permission !== "granted") {
        setState((prev) => ({
          ...prev,
          error: "Permission denied",
          isLoading: false,
        }));
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Get VAPID public key from environment or API
      const vapidResponse = await fetch("/api/notifications/vapid-key");
      const { publicKey } = await vapidResponse.json();

      if (!publicKey) {
        throw new Error("VAPID public key not available");
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      // Send subscription to server
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
          subscribedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription");
      }

      setState((prev) => ({
        ...prev,
        subscription,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error("Subscription error:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Subscription failed",
        isLoading: false,
      }));
      return false;
    }
  }, [state.isSupported, requestPermission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push
        await subscription.unsubscribe();

        // Notify server
        await fetch("/api/notifications/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });
      }

      setState((prev) => ({
        ...prev,
        subscription: null,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error("Unsubscribe error:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to unsubscribe",
        isLoading: false,
      }));
      return false;
    }
  }, []);

  return {
    ...state,
    subscribe,
    unsubscribe,
    requestPermission,
    checkSubscription,
  };
}

// Helper to show a local notification (for testing)
export async function showLocalNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (Notification.permission !== "granted") return;

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    icon: "/android-chrome-192x192.png",
    badge: "/android-chrome-192x192.png",
    ...options,
  });
}
