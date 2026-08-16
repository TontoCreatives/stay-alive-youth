export default {
  name: 'teachingTrack',
  title: 'Teaching Tracks',
  type: 'document',
  fields: [
    { name: 'title', title: 'Track Title', type: 'string' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
    { name: 'schedule', title: 'Schedule (e.g. Thursday Fellowship • 6 PM)', type: 'string' },
    { name: 'trackType', title: 'Track Type (e.g. Thursday Track)', type: 'string' },
    { name: 'description', title: 'Description', type: 'text' },
    { name: 'trackFlyer', title: 'Track Flyer / Image', type: 'image', options: { hotspot: true } },
    { 
      name: 'isArchived', 
      title: 'Archive this series?', 
      type: 'boolean', 
      initialValue: false,
      options: {
        layout: 'checkbox'
      }
    }
  ]
}