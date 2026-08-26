const { createClient } = require('@sanity/client');

// Initialize the backend client with your project ID and the write token you just generated
const client = createClient({
  projectId: 'y4q1h6a9',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // Must be false for writing data
  token: 'skDxp48jXdQ9QCPAPiCpcsEDd9msdgJV0Dk3owheYteRkzDzDC9vV9banoXb6WGtAsC68FZG5k446u6jyQouSuzjiKG7mEWo27uKk3SIIYt5W17EnI4KVjBlZYjYRwdPwZ77mcEmMU4NAC2yRRKDjgv2OujweLiRlwVHIfN3pHljTsCW00JV'
});

async function saveSubscription(subscriptionObj) {
  try {
    const doc = {
      _type: 'pushSubscription',
      endpoint: subscriptionObj.endpoint,
      keys: {
        p256dh: subscriptionObj.keys.p256dh,
        auth: subscriptionObj.keys.auth,
      },
      createdAt: new Date().toISOString(),
    };

    const res = await client.create(doc);
    console.log('Subscription saved to Sanity successfully!', res._id);
  } catch (err) {
    console.error('Failed to save subscription:', err);
  }
}

module.exports = { saveSubscription };