// global-offline.js

// 1. Auto-detect online/offline status and inject banner if missing
window.addEventListener('load', () => {
    // If you don't have the offline banner HTML in your markup yet, we can auto-inject it safely
    if (!document.querySelector('.offline-banner')) {
        const banner = document.createElement('div');
        banner.className = 'offline-banner';
        banner.innerHTML = 'You are currently offline. Check your connection.';
        document.body.prepend(banner);
    }

    const handleConnectionChange = () => {
        if (!navigator.onLine) {
            document.body.classList.add('is-offline');
        } else {
            document.body.classList.remove('is-offline');
        }
    };
    
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    handleConnectionChange();
});

// 2. Trigger streak milestone animation if user hits target days
const currentStreak = parseInt(localStorage.getItem('readingStreak') || '0', 10);
const streakCard = document.getElementById('streak-card-id');
if (streakCard && (currentStreak === 3 || currentStreak === 7 || currentStreak % 10 === 0)) {
    streakCard.classList.add('streak-milestone-pop');
}

// 3. Global Push Notification Handler
const publicVapidKey = BG5_uf1J5ta1TCCVWHtQpXOjyIn7ZqqZodNJzFRqxxTAywUpqQ8UM0PovCllP9S_uQRv0lB9ogrg79y_fKFfn3k// Replace with your Vercel VAPID Public Key

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

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('Notification permission was denied.');
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });

    console.log('Push Subscription Object:', JSON.stringify(subscription));
    alert('Successfully subscribed to notifications! Check console for subscription string.');
    
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe the user: ', error);
    alert('Failed to subscribe. Check console for details.');
  }
}