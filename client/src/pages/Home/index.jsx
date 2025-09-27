import React from 'react'
import Hero from '@/pages/Home/components/Hero'
import Award from '@/pages/Home/components/Award'
import Stats from '@/pages/Home/components/Stats'
import Pricing from '@/pages/Home/components/Pricing'
import Education from '@/pages/Home/components/Education'

const HomePage = () => {
  return (
    <div>
      
      <Hero/>
      <Award/>
      <Stats/>
      <Pricing/>
      <Education />
      {/* <OpenAccount /> */}
    
    </div>
  )
}

export default HomePage
