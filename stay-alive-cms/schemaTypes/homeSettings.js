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
    
    // --- ONGOING SERIES & MATERIALS CONTROL FIELDS ---
    { 
      name: 'featuredTitle', 
      title: 'Ongoing Series Title', 
      type: 'string',
      description: 'The title of the active study displayed on the homepage.'
    },
    { 
      name: 'featuredBadge', 
      title: 'Series Badge Text (e.g. Current Study)', 
      type: 'string',
      initialValue: 'Current Study'
    },
    { 
      name: 'featuredDate', 
      title: 'Series Date (e.g. Sunday 16th August 2026)', 
      type: 'string',
      description: 'The day the study takes place.'
    },
    { 
      name: 'featuredTime', 
      title: 'Series Time / Schedule (e.g. 10:00PM - 12:00PM)', 
      type: 'string',
      description: 'The time slot for the study session.'
    },
    { 
      name: 'featuredDescription', 
      title: 'Series Description', 
      type: 'text',
      description: 'A brief breakdown of what this ongoing session covers.'
    },
    { 
      name: 'featuredFlyer', 
      title: 'Series Flyer / Image', 
      type: 'image', 
      options: { hotspot: true },
      description: 'Upload the poster artwork for the current ongoing series.'
    },
    { 
      name: 'buttonText', 
      title: 'Action Button Text (e.g. Get Materials / Notes)', 
      type: 'string',
      initialValue: 'Get Study Materials'
    },
    { 
      name: 'buttonUrl', 
      title: 'Action Button Link URL', 
      type: 'url',
      description: 'Paste a link to your notes PDF, Google Drive link, or WhatsApp.'
    },
    // ------------------------------------------------

    { name: 'footerText', title: 'Footer Copyright Text', type: 'string' }
  ]
}