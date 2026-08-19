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
          { title: 'Video (YouTube / Embed)', value: 'video' }
        ],
        layout: 'radio'
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'mediaFile',
      title: 'Upload Audio File (MP3)',
      type: 'file',
      options: {
        accept: 'audio/*'
      },
      hidden: ({ document }) => document?.mediaType !== 'audio'
    },
    {
      name: 'youtubeUrl',
      title: 'YouTube Video URL',
      type: 'url',
      description: 'Paste the full YouTube link for the video (e.g., https://www.youtube.com/watch?v=...)',
      hidden: ({ document }) => document?.mediaType !== 'video'
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