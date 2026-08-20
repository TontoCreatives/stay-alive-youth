export default {
  name: 'homeSettings',
  title: 'Home & Site Settings',
  type: 'document',
  fields: [
    { name: 'siteTitle', title: 'Site Name / Brand Title', type: 'string' },
    { name: 'siteLogo', title: 'Global Logo Image', type: 'image', options: { hotspot: true } },
    { name: 'heroBadge', title: 'Hero Badge Text', type: 'string' },
    { name: 'heroTitle', title: 'Hero Main Title', type: 'string' },
    { name: 'heroHighlight', title: 'Hero Highlight Word (Yellow)', type: 'string' },
    { name: 'heroDescription', title: 'Hero Description Paragraph', type: 'text' },
    
    // --- DYNAMIC HERO CAROUSEL (NFS FADE EFFECT) ---
    {
      name: 'heroCarousel',
      title: 'Hero Image Carousel',
      type: 'array',
      description: 'Add multiple slides to create an auto-fading image carousel for the hero section.',
      of: [
        {
          type: 'object',
          name: 'slide',
          title: 'Slide',
          fields: [
            { name: 'image', title: 'Slide Image', type: 'image', options: { hotspot: true }, validation: Rule => Rule.required() },
            { name: 'badge', title: 'Badge Text (e.g. Active Community)', type: 'string', initialValue: 'Active Community' },
            { name: 'caption', title: 'Caption / Description', type: 'string' }
          ],
          preview: {
            select: {
              title: 'badge',
              subtitle: 'caption',
              media: 'image'
            }
          }
        }
      ]
    },
    
    // --- MULTIPLE ONGOING STUDIES / CURRICULUM SECTION ---
    {
      name: 'ongoingStudies',
      title: 'Ongoing Studies & Curriculum',
      type: 'array',
      description: 'Add, reorder, or remove active study cards displayed on the homepage.',
      of: [
        {
          type: 'object',
          name: 'studyCard',
          title: 'Study Card',
          fields: [
            { 
              name: 'featuredTitle', 
              title: 'Series Title', 
              type: 'string',
              validation: Rule => Rule.required() 
            },
            { name: 'featuredBadge', title: 'Badge Text (e.g. Current Study)', type: 'string', initialValue: 'Current Study' },
            { name: 'featuredDate', title: 'Date (e.g. Sunday 16th August 2026)', type: 'string' },
            { name: 'featuredTime', title: 'Time Slot (e.g. 10:00AM - 12:00PM)', type: 'string' },
            { name: 'featuredDescription', title: 'Series Description', type: 'text' },
            { name: 'featuredFlyer', title: 'Series Flyer / Poster Image', type: 'image', options: { hotspot: true } },
            { name: 'buttonText', title: 'Action Button Text', type: 'string', initialValue: 'Get Study Materials' },
            { name: 'buttonUrl', title: 'Action Button Link URL / Path', type: 'string' }
          ],
          preview: {
            select: {
              title: 'featuredTitle',
              subtitle: 'featuredBadge',
              media: 'featuredFlyer'
            },
            prepare({ title, subtitle, media }) {
              return {
                title: title || 'Untitled Study',
                subtitle: subtitle || 'Study Card',
                media: media
              }
            }
          }
        }
      ]
    },
    // ------------------------------------------------

    { name: 'footerText', title: 'Footer Copyright Text', type: 'string' }
  ]
}