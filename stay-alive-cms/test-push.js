const webpush = require('web-push');

// 1. Set your VAPID details (using your public key and Vercel private key)
const publicVapidKey = 'BG5_uf1J5ta1TCCVWHtQpXOjyIn7ZqqZodNJzFRqxxTAywUpqQ8UM0PovCllP9S_uQRv0lB9ogrg79y_fKFfn3k';
const privateVapidKey = 'hnaJxNDuXm92-Re6tEEbyW5ox12xkfIj5zZ71P2Fo18';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  publicVapidKey,
  privateVapidKey
);

// 2. Your live device subscription object
const pushSubscription = {
  endpoint: "https://wns2-par02p.notify.windows.com/w/?token=BQYAAAAbvn0T8YwXmI8R%2f5tinFhTil5osXVIqr7YnwYBD9rgZo9DDAThduqU%2fPKx6wsGF0DV4n7gNk%2b5DwWk9ukCelYa4EdHuuVdHjarx%2fZzv5bjHocrzTw6Sna%2b5tSlo6z9peXlkCONr3i6zmK5TvXShhGojMoJt%2bSXMJKqxhsFDZ4KDueUTKSTa3uYyfnQv7iRwjGvsmzFx5CWBlB30fRnxKKagYOrFpmQk8LdooArBPUqQjU99hQhVLYg7iIj6hWQWaZyVHmkmoGQisCinL5T2okQTt7ywN4x2vZfZTrjLjnGNQsaAF4NiMRjbLOrFBYGgcFmf0V16zrePIamtvVPssWF",
  keys: {
    p256dh: "BIvkd6UUBr9-Nxj3C_pdNEpjxmwlBNAIr8uQdpjB5iLEtCiMSLx1wq_h6Tzdv64wVKgbT0wXVvL3-SSM1QsLixc",
    auth: "4rMroZpBTRKnhs40_ouIRg"
  }
};

// 3. Define the notification content
const payload = JSON.stringify({
  title: "Stay Alive Update",
  body: "This is a live test notification from your backend script!"
});

// 4. Send the push notification
webpush.sendNotification(pushSubscription, payload)
  .then((result) => console.log('Push sent successfully!', result))
  .catch((error) => console.error('Error sending push:', error));