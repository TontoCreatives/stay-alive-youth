export default {
  name: 'questionBox',
  title: 'Question / Suggestion Box',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
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
      type: 'string',
    },
    {
      name: 'requestText',
      title: 'Question / Suggestion',
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
          { title: 'Reviewed', value: 'reviewed' },
          { title: 'Addressed', value: 'addressed' }
        ]
      },
      initialValue: 'new'
    },
    {
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    }
  ]
}