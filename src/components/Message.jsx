import React from 'react'
import "./CSS/Message.css"

const Message = ({text, sender, isOwn}) => {
  return (
    <div className={`message ${isOwn ? "own": ""}`}>
        {!isOwn &&<span className='sender'>{sender}</span>}
        <p className='message-txt'>{text}</p>
    </div>
  )
}

export default Message
