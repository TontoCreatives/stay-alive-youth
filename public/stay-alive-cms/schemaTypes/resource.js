export default {
  name: 'resource',
  title: 'Ministry Resources',
  type: 'document',
  fields: [
    { name: 'title', title: 'Resource Title', type: 'string' },
    { 
      name: 'category', 
      title: 'Resource Category', 
      type: 'string',
      options: {
        list: [
          { title: 'Sunday Book Study (10 AM - 12 PM)', value: 'sunday-study' },
          { title: 'Thursday Midweek Study & Prayer (6 PM - 8 PM)', value: 'thursday-midweek' },
          { title: 'Theological & Doctrinal Foundations', value: 'theological' },
          { title: 'Books of the Gospel & Commentary', value: 'gospels' },
          { title: 'Relationships & Covenant Life', value: 'relationships' },
          { title: 'Apologetics & Cultural Engagement', value: 'apologetics' },
          { title: 'Adulting & Practical Discipleship', value: 'adulting' }
        ],
        layout: 'dropdown'
      },
      initialValue: 'theological'
    },
    { name: 'categoryLabel', title: 'Category Tag (e.g. PDF Guide, E-Book)', type: 'string' },
    { 
      name: 'coverImage', 
      title: 'Book Cover / Thumbnail', 
      type: 'image',
      options: { hotspot: true } 
    },
    { name: 'trackName', title: 'Associated Track (e.g. Matthew 24 Track)', type: 'string' },
    { name: 'shortDescription', title: 'Short Description for Card', type: 'text' },
    { 
      name: 'mode', 
      title: 'Reading Mode', 
      type: 'string', 
      options: { 
        list: [
          { title: 'Rich Text Notes (Written on-site)', value: 'RichText' },
          { title: 'PDF E-Reader (Uploaded Document)', value: 'PDF_Viewer' }
        ] 
      },
      initialValue: 'RichText'
    },
    { 
      name: 'fullContent', 
      title: 'Full Online Reading Content (Used if Rich Text mode)', 
      type: 'blockContent' 
    },
    { 
      name: 'pdfFile', 
      title: 'Upload PDF / Document (Used if PDF E-Reader mode)', 
      type: 'file' 
    },
    { 
      name: 'allowDownload', 
      title: 'Enable PDF Download Button', 
      type: 'boolean',
      initialValue: false 
    }
  ]
}