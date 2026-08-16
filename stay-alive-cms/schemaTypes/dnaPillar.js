export default {
  name: 'dnaPillar',
  title: 'Ministry DNA Pillars',
  type: 'document',
  fields: [
    { name: 'number', title: 'Pillar Number (e.g. 01, 02)', type: 'string' },
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'scriptureQuote', title: 'Scripture Quote', type: 'text' },
    { name: 'scriptureReference', title: 'Reference (e.g. 2 Timothy 3:16-17)', type: 'string' },
    { name: 'orderRank', title: 'Display Order', type: 'number' }
  ]
}