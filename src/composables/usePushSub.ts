// Permission request and subscription creation are split so silent re-sync
// (lang change, page reload) never triggers the browser's permission popup.

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(normalized)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export function pushSupported(): boolean {
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    !!VAPID_PUBLIC_KEY
  )
}

export function pushPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied'
  return Notification.permission
}

// Triggers the browser's permission popup if the user hasn't decided yet.
// No-op if already granted or denied.
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission !== 'default') return Notification.permission
  return await Notification.requestPermission()
}

// Subscribes the SW to push and POSTs the subscription to /api/subscribe.
// Silent — never triggers the permission popup. Returns false if permission
// is not already granted.
export async function subscribeToPush(patientNumber: number, lang?: string): Promise<boolean> {
  if (!pushSupported()) return false
  if (Notification.permission !== 'granted') return false

  const registration = await navigator.serviceWorker.ready
  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
    })
  }

  const response = await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientNumber, subscription: subscription.toJSON(), lang }),
  })

  return response.ok
}

// Removes the Redis-side subscription mapping for a patient number.
// Browser-side PushSubscription is left intact so re-subscribing later
// (e.g., for a new number) doesn't need to re-prompt for permission.
export async function unsubscribeFromPush(patientNumber: number): Promise<boolean> {
  try {
    const response = await fetch('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientNumber }),
    })
    return response.ok
  } catch {
    return false
  }
}
