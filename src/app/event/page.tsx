import EventManagement from '@/component/event'
import { josefin } from '@/utils/font'
import React from 'react'

const EventPage = () => {
  return (
    <div>
      <h1 className={`text-4xl text-primaryColor ${josefin.className} mb-6`}>Events</h1>
      <div><EventManagement /></div>
    </div>
  )
}

export default EventPage

