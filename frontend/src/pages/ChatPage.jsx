import ChatPanel from '../components/ChatPanel'

export default function ChatPage({ token, canChat, processStatus, sessionLoading, onChatComplete }) {
  return (
    <div className="chat-card">
      <div className="chat-header">
        <h3>Chat with Documents</h3>
        <p className="muted">
          {canChat
            ? 'Ask questions about your indexed documents.'
            : processStatus === 'processing'
              ? 'Please wait while your documents are being indexed…'
              : 'Upload and process documents before chatting.'}
        </p>
      </div>

      <ChatPanel
        token={token}
        canChat={canChat}
        sessionLoading={sessionLoading}
        onChatComplete={onChatComplete}
      />
    </div>
  )
}
