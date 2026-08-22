const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'y4q1h6a9',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const subscriptionObj = req.body;

    if (!subscriptionObj || !subscriptionObj.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }

    const doc = {
      _type: 'pushSubscription',
      endpoint: subscriptionObj.endpoint,
      keys: {
        p256dh: subscriptionObj.keys.p256dh,
        auth: subscriptionObj.keys.auth,
      },
      createdAt: new Date().toISOString(),
    };

    const response = await client.create(doc);
    return res.status(200).json({ success: true, id: response._id });
  } catch (err) {
    console.error('Error saving subscription to Sanity:', err);
    return res.status(500).json({ error: 'Failed to save subscription' });
  }
}