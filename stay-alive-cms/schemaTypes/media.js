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
      title: 'Media Type (Categorization)',
      type: 'string',
      options: {
        list: [
          { title: 'Audio (MP3)', value: 'audio' },
          { title: 'Video (YouTube / Embed)', value: 'video' }
        ],
        layout: 'radio'
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'mediaFile',
      title: 'Direct File Upload (Audio or Video)',
      type: 'file',
      description: 'Upload a direct file here if you are not using a YouTube link.'
      // HIDDEN logic removed so this is always visible
    },
    {
      name: 'youtubeUrl',
      title: 'YouTube Video URL',
      type: 'url',
      description: 'Paste the full YouTube link here (e.g., https://www.youtube.com/watch?v=...)'
      // HIDDEN logic removed so this is always visible
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