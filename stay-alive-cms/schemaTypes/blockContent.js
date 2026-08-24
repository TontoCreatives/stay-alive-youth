import {defineType, defineArrayMember} from 'sanity'

/**
 * This is the schema definition for the rich text fields used for
 * for this blog studio. When you import it in schemas.js it can be
 * reused in other parts of the studio with:
 *   {
 *     name: 'someName',
 *     title: 'Some title',
 *     type: 'blockContent'
 *   }
 */
export default defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      title: 'Block',
      type: 'block',
      // Styles let you set what your user can mark up blocks with. These
      // correspond with HTML tags, but you can set any title or value
      // you want and decide how you want to deal with it where you want to
      // use your content.
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H1', value: 'h1'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'H4', value: 'h4'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [{title: 'Bullet', value: 'bullet'}],
      // Marks let you mark up inline text in the block editor.
      marks: {
        // Decorators usually describe a single property – e.g. a typographic
        // preference or highlighting by editors.
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
        ],
        // Annotations can be any object structure – e.g. a link or a footnote.
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
              },
            ],
          },
        ],
      },
    }),
    
    // Standard Image block with caption option
    defineArrayMember({
      type: 'image',
      options: {hotspot: true},
      fields: [
        {
          name: 'caption',
          type: 'string',
          title: 'Image Caption',
        }
      ]
    }),

    // Custom MP3 Audio Block
    defineArrayMember({
      name: 'audioEmbed',
      title: 'Audio (MP3)',
      type: 'object',
      fields: [
        { name: 'title', title: 'Track Name / Title', type: 'string' },
        { name: 'file', title: 'Upload MP3 File', type: 'file', options: { accept: 'audio/mpeg' } },
        { name: 'url', title: 'Or External MP3 URL', type: 'url' }
      ]
    }),

    // Custom Video Block
    defineArrayMember({
      name: 'videoEmbed',
      title: 'Video Embed',
      type: 'object',
      fields: [
        { name: 'url', title: 'YouTube / Video URL', type: 'url' },
        { name: 'caption', title: 'Video Caption', type: 'string' }
      ]
    }),
  ],
})