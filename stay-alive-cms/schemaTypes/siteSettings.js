export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'siteTitle',
      title: 'Site Title',
      type: 'string',
    },
    {
      name: 'logo',
      title: 'Main Logo',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'brandAccentColor',
      title: 'Brand Accent Color (Hex)',
      type: 'string',
      description: 'e.g., #FACC15 for yellow'
    },
    {
      name: 'whatsappNumber',
      title: 'WhatsApp Contact Number',
      type: 'string',
    }
  ]
}