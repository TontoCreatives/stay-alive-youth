export default {
  name: 'devotional',
  title: 'Daily Devotional',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'publishedAt',
      title: 'Date',
      type: 'date',
    },
    {
      name: ' scriptureRef',
      title: 'Scripture Reference (e.g., Romans 12:1-2)',
      type: 'string',
    },
    {
      name: 'scriptureText',
      title: 'Scripture Text',
      type: 'text',
    },
    {
      name: 'mainImage',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true },
    },
    // OIA Method Breakdown
    {
      name: 'observation',
      title: '1. Observation (What does the text say?)',
      type: 'text',
    },
    {
      name: 'interpretation',
      title: '2. Interpretation (What does it mean in context?)',
      type: 'text',
    },
    {
      name: 'application',
      title: '3. Application (How does it change how we live?)',
      type: 'text',
    },
    {
      name: 'closingPrayer',
      title: 'Closing Prayer / Reflection Prompt',
      type: 'text',
    }
  ]
}