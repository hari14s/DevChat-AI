import { useRef, useEffect, useState } from 'react';
import './chatInputBar.css';

export default function ChatInputBar({ onSend }: { onSend: (msg: string) => void }){
    const [text, setText] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [text]);
    
  const sendMessage = () => {
    console.log("Sending message:", text);
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
    textareaRef.current.style.height = "auto";
  }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

    return (
        <div className="chat-input-bar">
            <textarea ref={textareaRef} className="chat-input"
                      placeholder="Type a message... use @filename to attach"
                      value={text}
                      rows={1}
                      onChange={(e) =>setText(e.target.value)}
                      onKeyDown={handleKeyDown}
            />
            <button className="send-button" onClick={sendMessage}>➤</button>
        </div>
    );
}