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
    },
    {
      name: 'weeklyVerse',
      title: 'Weekly Memory Verse',
      type: 'text',
      description: 'The scripture text for this week',
    },
    {
      name: 'verseReference',
      title: 'Verse Reference',
      type: 'string',
      description: 'The book, chapter, and verse (e.g., Psalm 139:23–24)',
    },
    {
      name: 'currentSeries',
      title: 'Current Series Title',
      type: 'string',
      description: 'The active series or track name',
    }
  ]
}