export default {
  name: 'event',
  title: 'Events',
  type: 'document',
  fields: [
    { name: 'title', title: 'Event Title', type: 'string' },
    { name: 'badge', title: 'Badge Text (e.g. Thursday Study)', type: 'string' },
    { name: 'schedule', title: 'Timing / Time Slot', type: 'string' },
    { name: 'dateText', title: 'Date Subtext (e.g. Every Thursday)', type: 'string' },
    { name: 'description', title: 'Description', type: 'text' },
    { name: 'mainImage', title: 'Event Image', type: 'image', options: { hotspot: true } }
  ]
}