// 3. Global Push Notification Handler
const publicVapidKey = 'BG5_uf1J5ta1TCCVWHtQpXOjyIn7ZqqZodNJzFRqxxTAywUpqQ8UM0PovCllP9S_uQRv0lB9ogrg79y_fKFfn3k';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported by this browser.');
    alert('Push notifications are not supported on this device/browser.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered successfully.');

    // Wait for the service worker to be fully active and ready
    const activeRegistration = await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('Notification permission was denied.');
      return;
    }

    const subscription = await activeRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });

    console.log('Push Subscription Object:', JSON.stringify(subscription));

    // Send it to your Vercel serverless API endpoint
    await fetch('/api/save-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    // Update button visually instead of showing a cheap alert box
    const btn = document.querySelector('button[onclick*="subscribeToPushNotifications"]');
    if (btn) {
      btn.textContent = 'Notifications Enabled ✓';
      btn.classList.remove('bg-brandYellow', 'text-zinc-950');
      btn.classList.add('bg-emerald-600', 'text-white');
      btn.disabled = true;
    }
    
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe the user: ', error);
    alert('Error: ' + error.message);
  }
}