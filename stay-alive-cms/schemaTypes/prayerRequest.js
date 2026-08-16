export default {
  name: 'prayerRequest',
  title: 'Prayer Requests',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name (Optional / Anonymous)', type: 'string' },
    { name: 'contact', title: 'Email or Phone (For leadership response)', type: 'string' },
    { name: 'requestText', title: 'Prayer Request', type: 'text' },
    { 
      name: 'status', 
      title: 'Status', 
      type: 'string', 
      options: { 
        list: [
          { title: 'New', value: 'new' },
          { title: 'Prayed For', value: 'prayed' }
        ] 
      },
      initialValue: 'new'
    },
    { name: 'submittedAt', title: 'Submission Date', type: 'datetime', initialValue: () => new Date().toISOString() }
  ]
}