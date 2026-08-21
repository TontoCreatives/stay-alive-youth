import webpush from 'web-push';

webpush.setVapidDetails(
    'mailto:admin@stayalive.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { subscription, title, body, url } = req.body;

    if (!subscription) {
        return res.status(400).json({ error: 'No subscription object provided for testing' });
    }

    try {
        const payload = JSON.stringify({
            title: title || 'Stay Alive Devotion 📖',
            body: body || 'Today’s word is live. Tap to read.',
            url: url || '/'
        });

        await webpush.sendNotification(subscription, payload);

        return res.status(200).json({ success: true, message: 'Push notification sent successfully!' });
    } catch (error) {
        console.error('Error sending test push:', error);
        return res.status(500).json({ error: error.message || 'Failed to send notification' });
    }
}