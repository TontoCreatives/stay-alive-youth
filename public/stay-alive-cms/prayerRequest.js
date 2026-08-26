export default {
  name: 'prayerRequest',
  title: 'Prayer Requests',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
    },
    {
      name: 'contact',
      title: 'Contact Info',
      type: 'string',
    },
    {
      name: 'requestText',
      title: 'Prayer Request',
      type: 'text',
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
    },
    {
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
    }
  ]
}