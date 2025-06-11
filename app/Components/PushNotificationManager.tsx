
//@ts-nocheck
"use client";
import { useEffect, useState } from "react";
import { app } from "../lib/firebase";

export function PushNotificationManager() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      setError("Push notifications are not supported in this browser.");
      setStatus("error");
      return;
    }

    // Register service worker
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        console.log("Service Worker registered:", registration);
      } catch (err) {
        console.error("Service Worker registration failed:", err);
        setError("Failed to register service worker.");
        setStatus("error");
      }
    };

    registerServiceWorker();

    // Initialize Firebase Messaging
    import("firebase/messaging").then(({ getMessaging, getToken, onMessage }) => {
      const messaging = getMessaging(app);

      const requestToken = async () => {
        setStatus("loading");
        try {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            setError("Notification permission denied. Please allow notifications in browser settings.");
            setStatus("error");
            return;
          }

          const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
          if (!vapidKey) {
            throw new Error("VAPID key is not set in environment variables.");
          }

          const currentToken = await getToken(messaging, { vapidKey });
          if (currentToken) {
            console.log("FCM token:", currentToken);
            setToken(currentToken);
            localStorage.setItem("fcm_token", currentToken);
            setStatus("success");

            // Send token to your server (optional)
            await fetch("/api/push/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: currentToken }),
            });
          } else {
            setError("No registration token available. Please try again.");
            setStatus("error");
          }
        } catch (err) {
          console.error("Error getting FCM token:", err);
          setError(`Failed to get FCM token: ${err.message || "Unknown error."}`);
          setStatus("error");
        }
      };

      requestToken();

      // Handle foreground messages
      onMessage(messaging, (payload) => {
        console.log("Foreground message:", payload);
        new Notification(payload.notification?.title || "Notification", {
          body: payload.notification?.body,
          icon: payload.notification?.icon,
        });
      });
    });
  }, []);

  // Optional UI for debugging/testing
  return (
    < >
    
    </>
  );

  // Alternative: Keep silent component (uncomment to use)
  // return null;
}