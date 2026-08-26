import {definePlugin} from 'sanity'
import {Analytics} from '@vercel/analytics/react'

export const vercelAnalyticsPlugin = definePlugin({
  name: 'vercel-analytics',
  studio: {
    components: {
      layout: (props) => {
        return (
          <>
            {props.renderDefault(props)}
            <Analytics />
          </>
        )
      },
    },
  },
})
