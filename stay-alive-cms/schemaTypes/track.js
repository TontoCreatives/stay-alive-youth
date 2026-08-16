export default {
  name: 'track',
  title: 'Series & Study Tracks',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Track Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'schedule',
      title: 'Schedule / Time Badge (e.g. Thursday Fellowship • 6:00 PM)',
      type: 'string'
    },
    {
      name: 'description',
      title: 'Track Description',
      type: 'text',
      rows: 4
    },
    {
      name: 'image',
      title: 'Track Poster / Cover Image',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'isArchived',
      title: 'Move to Past Archives?',
      type: 'boolean',
      description: 'Check this box if this series track is completed and should drop into the Past Archives section.',
      initialValue: false
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    }
  ]
}