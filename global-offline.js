// 3. Global Push Notification Handler & Startup Check
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

// Check on startup: If already subscribed, hide the entire prompt box instantly
(async function checkExistingSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    const promptBox = document.getElementById('notification-prompt-box');
    
    if (subscription && promptBox) {
      promptBox.style.display = 'none'; // Hides the box completely so it never nags them again
    }
  } catch (err) {
    console.error('Error checking existing subscription:', err);
  }
})();

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

    // Hide the prompt box smoothly after successful subscription
    const promptBox = document.getElementById('notification-prompt-box');
    if (promptBox) {
      promptBox.style.display = 'none';
    }
    
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe the user: ', error);
    alert('Error: ' + error.message);
  }
}