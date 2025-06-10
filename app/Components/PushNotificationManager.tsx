// "use client"

// import { useEffect, useState } from "react"

// function urlBase64ToUint8Array(base64String: string) {
//   const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
//   const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

//   const rawData = window.atob(base64)
//   const outputArray = new Uint8Array(rawData.length)

//   for (let i = 0; i < rawData.length; ++i) {
//     outputArray[i] = rawData.charCodeAt(i)
//   }
//   return outputArray
// }

// export function PushNotificationManager() {
//   const [isSupported, setIsSupported] = useState(false)
//   const [subscription, setSubscription] = useState<PushSubscription | null>(null)
//   const [message, setMessage] = useState("")

//   useEffect(() => {
//     if ("serviceWorker" in navigator && "PushManager" in window) {
//       setIsSupported(true)
//       registerServiceWorker()
//     }
//   }, [])

//   async function registerServiceWorker() {
//     try {
//       const registration = await navigator.serviceWorker.register("/sw.js", {
//         scope: "/",
//         updateViaCache: "none",
//       })
//       const sub = await registration.pushManager.getSubscription()
//       setSubscription(sub)
//     } catch (error) {
//       console.error("Service Worker registration failed:", error)
//     }
//   }

//   async function subscribeToPush() {
//     try {
//       const registration = await navigator.serviceWorker.ready
//       const sub = await registration.pushManager.subscribe({
//         userVisibleOnly: true,
//         applicationServerKey: urlBase64ToUint8Array(
//           process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
//         ),
//       })
//       setSubscription(sub)

//       // Call your Next.js API route to save subscription server-side
//       await fetch("/api/push/subscribe", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(sub.toJSON()),
//       })
//     } catch (error) {
//       console.error("Subscription failed:", error)
//     }
//   }

//   async function unsubscribeFromPush() {
//     try {
//       if (!subscription) return
//       await subscription.unsubscribe()
//       setSubscription(null)

//       // Notify server to remove subscription
//       await fetch("/api/push/unsubscribe", { method: "POST" })
//     } catch (error) {
//       console.error("Unsubscribe failed:", error)
//     }
//   }

//   async function sendTestNotification() {
//     if (!subscription) return

//     try {
//       await fetch("/api/push/send", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message }),
//       })
//       setMessage("")
//     } catch (error) {
//       console.error("Sending notification failed:", error)
//     }
//   }

//   if (!isSupported) {
//     return <p>Push notifications are not supported in this browser.</p>
//   }

//   return (
//     <div>
//       <h3>Push Notifications</h3>
//       {subscription ? (
//         <>
//           <p>You are subscribed to push notifications.</p>
//           <button onClick={unsubscribeFromPush}>Unsubscribe</button>
//           <input
//             type="text"
//             placeholder="Enter notification message"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//           />
//           <button onClick={sendTestNotification} disabled={!message.trim()}>
//             Send Test
//           </button>
//         </>
//       ) : (
//         <>
//           <p>You are not subscribed to push notifications.</p>
//           <button onClick={subscribeToPush}>Subscribe</button>
//         </>
//       )}
//     </div>
//   )
// }
'use client';
import { useEffect } from 'react';
import { app } from '../lib/firebase';

export function PushNotificationManager() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator)
    )
      return;

    import('firebase/messaging').then(({ getMessaging, getToken, onMessage }) => {
      const messaging = getMessaging(app);

      Notification.requestPermission().then(permission => {
        if (permission !== 'granted') return;

        getToken(messaging, {
          vapidKey:process.env.NEXT_PUBLIC_VAPID_KEY,
        }).then(token => {
          console.log('FCM token:', token);
          localStorage.setItem('fcm_token', token);
        });
      });

      onMessage(messaging, payload => {
        console.log('Foreground message:', payload);
        new Notification(payload.notification?.title || 'Notification', {
          body: payload.notification?.body,
        });
      });
    });
  }, []);

  return null;
}
