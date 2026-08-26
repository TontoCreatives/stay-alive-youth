export default {
  name: 'coordinator',
  title: 'Bible Study Coordinators & Leadership',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Full Name',
      type: 'string',
      description: 'e.g., Antony Mutahi, Dennis White, Grace Muthoni, or Timothy Munene',
      validation: Rule => Rule.required()
    },
    {
      name: 'role',
      title: 'Role / Title',
      type: 'string',
      description: 'e.g., Bible Study Coordinator or Youth Chairman',
      validation: Rule => Rule.required()
    },
    {
      name: 'category',
      title: 'Leadership Category',
      type: 'string',
      options: {
        list: [
          { title: 'Youth Chairman / Main Leadership', value: 'chairman' },
          { title: 'Bible Study Coordinator', value: 'coordinator' }
        ],
        layout: 'radio'
      },
      initialValue: 'coordinator'
    },
    {
      name: 'orderRank',
      title: 'Display Order',
      type: 'number',
      description: 'Determines the sequence in which profiles appear (e.g., 1, 2, 3...)'
    },
    {
      name: 'image',
      title: 'Profile Photo',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'bio',
      title: 'Short Bio / Note',
      type: 'text',
      rows: 3,
      description: 'A brief description or personal note for future use.'
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'image'
    }
  }
}