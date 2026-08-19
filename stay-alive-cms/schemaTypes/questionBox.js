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
      name: 'contact',
      title: 'Contact Info',
      type: 'string',
    },
    {
      name: 'requestText',
      title: 'Question / Suggestion',
      type: 'text',
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
      }
    },
    {
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
    }
  ]
}