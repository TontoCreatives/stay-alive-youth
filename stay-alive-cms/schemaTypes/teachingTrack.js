export default {
  name: 'teachingTrack',
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
      name: 'headingTag',
      title: 'Heading Tag Size',
      type: 'string',
      options: {
        list: [
          { title: 'H1 (Larger)', value: 'h1' },
          { title: 'H2 (Standard)', value: 'h2' }
        ],
        layout: 'radio'
      },
      initialValue: 'h2'
    },
    {
      name: 'titleColor',
      title: 'Title Color Style',
      type: 'string',
      options: {
        list: [
          { title: 'Default White', value: 'text-white' },
          { title: 'Brand Yellow', value: 'text-brandYellow' },
          { title: 'Zinc Light Gray', value: 'text-zinc-200' }
        ],
        layout: 'dropdown'
      },
      initialValue: 'text-white'
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
      title: 'Track Description (Rich Text)',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H3 Subheading', value: 'h3' }
          ],
          marks: {
            decorators: [
              { title: 'Strong (Bold)', value: 'strong' },
              { title: 'Emphasis (Italic)', value: 'em' }
            ]
          }
        }
      ]
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
      name: 'mainImage',
      title: 'Main Image (Legacy Support)',
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