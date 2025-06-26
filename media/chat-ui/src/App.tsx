import React from 'react';
import './App.css';
import ChatInputBar from './Components/chatInputBar';
import { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';

const vscode = (window as any).acquireVsCodeApi?.()

function App() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);

  function extractMentions(message: string): string[] {
  const regex = /@([\w\-./\\]+)/g;
  const matches = [];
  let match;
  while ((match = regex.exec(message))) {
    const cleaned = match[1].replace(/\\/g, "/").trim();
    matches.push(cleaned);
  }
  return matches;
}

  const handleSend = (msg: string) => {
    setMessages(prev => [...prev, { sender: "You", text: msg }]);
    const mentions = extractMentions(msg);
    if(mentions.length > 0){
      vscode.postMessage({
        type: "WithFiles",
        files : mentions,
        message: msg
      });
    }else{
      vscode.postMessage({
        type: "TextOnly",
        message: msg
      })
    }
    console.log("message in handle send:", msg);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data;
      console.log("Webview received in frontend:", msg);
      if (!msg || typeof msg !== "object") return;

      if (msg.type === "aiResponse") {
        setMessages(prev => [...prev, { sender: "AI", text: msg.content }]);
      } else if (msg.type === "error") {
        setMessages(prev => [...prev, { sender: "System", text: `${msg.error}` }]);
      }
    };

    window.addEventListener("message", handleMessage);
    console.log("Webview listener active");
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const chatWindow = document.querySelector('.chat-window');
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="App">
      <div className='chat-window'>
        {messages.map((m, i) => (
          <div key={i} className={m.sender === "AI" ? "ai-message" : "user-message"}>
            {m.sender === "AI" ? (
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {m.text}
              </ReactMarkdown>) : ( m.text )}
          </div>
        ))}
      </div>
      <ChatInputBar onSend={handleSend} />
    </div>
  );
}

export default App;
