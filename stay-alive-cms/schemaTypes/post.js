import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt / Short Summary',
      type: 'text',
      rows: 3,
      description: 'A short 1-2 sentence summary shown at the top of the article and used as the preview text in push notifications. Keep it under 150 characters.',
      validation: Rule => Rule.max(200).warning('Keep excerpts concise — long excerpts get cut off in notifications.'),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: {type: 'author'},
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'categories',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Theological Reflection', value: 'Theological Reflection' },
          { title: 'Scripture Study', value: 'Scripture Study' },
          { title: 'Relationships & Marriage', value: 'Relationships & Marriage' },
          { title: 'Discipleship', value: 'Discipleship' },
          { title: 'Essay', value: 'Essay' }
        ],
        layout: 'dropdown',
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
    defineField({
      name: 'studyNotes',
      title: 'Study Notes & Insights',
      type: 'text',
      description: 'Write or paste the breakdown of today scriptural text or theme',
    }),
    defineField({
      name: 'questionnaire',
      title: 'Discussion & Devotional Questions',
      type: 'text',
      description: 'Questions for group discussion or personal self-reflection',
    }),
    defineField({
      name: 'notifyOnPublish',
      title: 'Send push notification when published/updated?',
      description: 'Turn this OFF when fixing a typo or minor edit on an already-published article, so people don\'t get re-notified about old content.',
      type: 'boolean',
      initialValue: true,
    }),
  ],

  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
      category: 'categories',
    },
    prepare(selection) {
      const {author, category} = selection
      const authorText = author ? `by ${author}` : ''
      const categoryText = category ? `[${category}]` : ''
      return {
        ...selection, 
        subtitle: [categoryText, authorText].filter(Boolean).join(' ')
      }
    },
  },
})