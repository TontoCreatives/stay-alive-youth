export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { title, slug } = req.body;

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
       'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        app_id: 'dd6ec3c5-2179-4e3a-af4f-ae6d6ef24d60',
        included_segments: ['All'],
        headings: { en: 'New Daily Devotional!' },
        contents: { en: title || 'Check out today’s new devotional entry.' },
        url: `https://tontocreatives.github.io/stay-alive-youth/devotional.html?slug=${slug}`
      })
    });

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}