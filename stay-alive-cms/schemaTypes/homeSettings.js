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
    { name: 'heroImage', title: 'Hero Banner Image', type: 'image', options: { hotspot: true } },
    { name: 'footerText', title: 'Footer Copyright Text', type: 'string' }
  ]
}