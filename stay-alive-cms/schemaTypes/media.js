export default {
  name: 'mediaItem',
  title: 'Audio & Video Library',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 }
    },
    {
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          { title: 'Audio (MP3)', value: 'audio' },
          { title: 'Video (MP4 / Embed)', value: 'video' }
        ],
        layout: 'radio'
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'mediaFile',
      title: 'Upload Media File',
      type: 'file',
      options: {
        accept: 'audio/*,video/*'
      }
    },
    {
      name: 'description',
      title: 'Description / Notes',
      type: 'text'
    },
    {
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime'
    }
  ]
}