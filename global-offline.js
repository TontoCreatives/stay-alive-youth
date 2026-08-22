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

    alert('Successfully subscribed and saved to database!');
    
    return subscription;
  }