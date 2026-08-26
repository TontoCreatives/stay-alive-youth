export default {
  name: 'prayerRequest',
  title: 'Prayer Requests',
  type: 'document',
  fields: [
    { 
      name: 'name', 
      title: 'Name (Optional / Anonymous)', 
      type: 'string' 
    },
    { 
      name: 'preferredChannel', 
      title: 'Preferred Reply Channel', 
      type: 'string',
      options: {
        list: [
          { title: 'WhatsApp', value: 'whatsapp' },
          { title: 'Email', value: 'email' }
        ],
        layout: 'radio'
      },
      initialValue: 'whatsapp'
    },
    { 
      name: 'contact', 
      title: 'Contact Info (Phone Number or Email)', 
      type: 'string' 
    },
    { 
      name: 'requestText', 
      title: 'Prayer Request', 
      type: 'text',
      validation: Rule => Rule.required()
    },
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
    { 
      name: 'submittedAt', 
      title: 'Submission Date', 
      type: 'datetime', 
      initialValue: () => new Date().toISOString() 
    }
  ]
}