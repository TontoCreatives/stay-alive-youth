import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {vercelAnalyticsPlugin} from './plugins/vercelAnalytics.jsx'

export default defineConfig({
  name: 'default',
  title: 'Stay Alive CMS',

  projectId: 'y4q1h6a9',
  dataset: 'production',

  plugins: [structureTool(), visionTool(), vercelAnalyticsPlugin()],

  schema: {
    types: schemaTypes,
  },
})
