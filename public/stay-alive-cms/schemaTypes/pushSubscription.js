export default {
  name: 'pushSubscription',
  title: 'Push Subscription',
  type: 'document',
  fields: [
    {
      name: 'endpoint',
      title: 'Endpoint',
      type: 'string',
    },
    {
      name: 'keys',
      title: 'Keys',
      type: 'object',
      fields: [
        { name: 'p256dh', title: 'P256DH', type: 'string' },
        { name: 'auth', title: 'Auth', type: 'string' }
      ]
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
    }
  ]
};