import blockContent from './blockContent'
import category from './category'
import post from './post'
import author from './author'
import siteSettings from './siteSettings'
import teachingTrack from './teachingTrack'
import event from './event'
import dnaPillar from './dnaPillar'
import homeSettings from './homeSettings'
import resource from './resource'
import prayerRequest from './prayerRequest'
import questionBox from './questionBox' // 1. Import it here
import coordinator from './coordinator'
import mediaItem from './mediaItem'

export const schemaTypes = [
  post, 
  author, 
  category, 
  blockContent, 
  siteSettings, 
  teachingTrack, 
  event, 
  dnaPillar, 
  homeSettings, 
  resource, 
  prayerRequest,
  questionBox, // 2. Add it to the array
  coordinator,
  mediaItem
]