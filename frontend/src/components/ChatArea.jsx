import React, { useEffect, useRef } from 'react'

export default function ChatArea(){
  const ref = useRef(null)

  useEffect(()=>{
    if(ref.current) ref.current.scrollTop = ref.current.scrollHeight
  })

  return (
    <div className="chat-area">
      <div className="messages" ref={ref}>
        <div className="msg ai">Hello, ask me about your documents.</div>
      </div>
      <div className="composer">
        <input placeholder="Type a message..." />
        <button className="btn primary">Send</button>
      </div>
    </div>
  )
}
