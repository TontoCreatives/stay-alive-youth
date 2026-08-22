const { createClient } = require('@sanity/client');
const webpush = require('web-push');

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  'mailto:admin@stayalive.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const client = createClient({
  projectId: 'y4q1h6a9',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN
});

module.exports = async function handler(req, res) {
  try {
    // 1. Fetch the latest devotion from your Sanity Studio
    const latestDevotion = await client.fetch(
      `*[_type == "devotional"] | order(publishedAt desc)[0]{ title, excerpt }`
    );

    if (!latestDevotion) {
      return res.status(404).json({ error: 'No devotion found to send.' });
    }

    // 2. Fetch all saved push subscriptions from Sanity
    const subscriptions = await client.fetch(
      `*[_type == "pushSubscription"]{ endpoint, keys }`
    );

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({ message: 'No subscribers found.' });
    }

    const payload = JSON.stringify({
      title: latestDevotion.title || 'New Daily Devotion',
      body: latestDevotion.excerpt || 'Tap to read today’s word.',
      url: '/'
    });

    // 3. Loop through all subscribers and send the notification
    const pushPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth
        }
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
      } catch (err) {
        // If a user uninstalled or revoked permissions, clean it up from Sanity
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`Removing expired subscription: ${sub.endpoint}`);
          await client.delete({ query: `*[_type == "pushSubscription" && endpoint == "${sub.endpoint}"]` });
        } else {
          console.error('Error sending push:', err);
        }
      }
    });

    await Promise.all(pushPromises);

    return res.status(200).json({ success: true, sentCount: subscriptions.length });
  } catch (err) {
    console.error('Broadcast error:', err);
    return res.status(500).json({ error: 'Failed to send notifications' });
  }
};