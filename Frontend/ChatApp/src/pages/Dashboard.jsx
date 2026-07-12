import React from 'react'
import "./Dashboard.css"
import Sidebar from '../components/Sidebar'
import ChatHeader from '../components/ChatHeader'
import MessageArea from '../components/MessageArea'
import MessageInput from '../components/MessageInput'
export const Dashboard = () => {
  return (
    <div className='dashboardflex'>
      <div>
        <Sidebar></Sidebar> 
      </div>
      <div className='dashboardflex2'>
         <ChatHeader></ChatHeader>
  <MessageArea></MessageArea> 
      <MessageInput></MessageInput>
      </div>
   
    
    </div>
  )
}
