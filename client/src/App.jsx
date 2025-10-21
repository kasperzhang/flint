import React, { useRef, useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const CHAT_STORAGE_KEY = 'flint_chat_history';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const initialMessages = [
  {
    role: "assistant",
    content: "Hi! I'm flint. Tell me your product idea, and let's dive into it!",
  },
];

// Function to summarize conversation using AI
async function summarizeConversation(messages) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          ...messages,
          {
            role: 'user',
            content: 'Please summarize the key points of our conversation in 2-3 concise sentences.'
          }
        ]
      })
    });
    const data = await response.json();
    return data?.message?.content || 'Conversation summary not available';
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Error generating summary';
  }
}

export default function App() {
  // Load messages from localStorage on initial render
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialMessages;
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [prdComplete, setPrdComplete] = useState(false);
  const [prdContent, setPrdContent] = useState("");
  const chatRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Detect PRD completion (AI signals with a special token)
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "assistant" && lastMsg.content.startsWith("# PRD")) {
      setPrdComplete(true);
      setPrdContent(lastMsg.content);
    }
  }, [messages]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 1) { // Don't save initial message
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const userMsg = { role: "user", content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    
    try {
      console.log('Sending request to /api/chat with messages:', updatedMessages);
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Received response:', data);
      
      if (data?.message) {
        const aiResponse = data.message;
        const finalMessages = [...updatedMessages, aiResponse];
        
        // Generate and save summary after some conversation
        if (finalMessages.length >= 4) {
          try {
            const summary = await summarizeConversation(finalMessages);
            console.log('Conversation summary:', summary);
          } catch (summaryError) {
            console.error('Error generating summary:', summaryError);
            // Don't fail the whole request if summary fails
          }
        }
        
        setMessages(finalMessages);
      } else {
        throw new Error('Invalid response format: No message in response');
      }
    } catch (error) {
      console.error('Error in handleSend:', error);
      const errorMessage = error.message || 'An unknown error occurred';
      setMessages(msgs => [
        ...msgs,
        { 
          role: "assistant", 
          content: `Error: ${errorMessage}. Please try again or check the console for details.`,
          isError: true
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([prdContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "PRD.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      localStorage.removeItem(CHAT_STORAGE_KEY);
      setMessages(initialMessages);
      setPrdComplete(false);
      setPrdContent("");
    }
  };

  return (
    <div className="container">
      <header>
        <span className="logo">flint</span>
        <div className="header-buttons">
          <button
            className="clear-btn"
            onClick={handleClearChat}
            disabled={loading}
            title="Clear chat history"
          >
            🗑️ Clear
          </button>
          <button
            className="export-btn"
            onClick={handleExport}
            disabled={!prdComplete}
          >
            Export PRD
          </button>
        </div>
      </header>
      <div className="chat" ref={chatRef}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`msg ${msg.role === "user" ? "user" : "ai"} ${msg.isError ? 'error' : ''}`}
          >
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                // Custom styling for markdown elements
                h1: ({node, ...props}) => <h1 style={{fontSize: '1.5em', margin: '0.5em 0'}} {...props} />,
                h2: ({node, ...props}) => <h2 style={{fontSize: '1.3em', margin: '0.5em 0'}} {...props} />,
                h3: ({node, ...props}) => <h3 style={{fontSize: '1.1em', margin: '0.5em 0'}} {...props} />,
                p: ({node, ...props}) => <p style={{margin: '0.5em 0'}} {...props} />,
                ul: ({node, ...props}) => <ul style={{margin: '0.5em 0', paddingLeft: '1.5em'}} {...props} />,
                ol: ({node, ...props}) => <ol style={{margin: '0.5em 0', paddingLeft: '1.5em'}} {...props} />,
                li: ({node, ...props}) => <li style={{margin: '0.25em 0'}} {...props} />,
                blockquote: ({node, ...props}) => (
                  <blockquote 
                    style={{
                      borderLeft: '3px solid #ddd',
                      margin: '0.5em 0',
                      paddingLeft: '1em',
                      color: '#666',
                      fontStyle: 'italic'
                    }} 
                    {...props} 
                  />
                ),
                code: ({node, inline, ...props}) => 
                  inline ? 
                    <code style={{
                      background: '#f0f0f0',
                      padding: '0.2em 0.4em',
                      borderRadius: '3px',
                      fontFamily: 'monospace',
                      fontSize: '0.9em'
                    }} {...props} /> :
                    <pre style={{
                      background: '#f5f5f5',
                      padding: '1em',
                      borderRadius: '4px',
                      overflowX: 'auto',
                      margin: '0.5em 0'
                    }}><code {...props} /></pre>,
                a: ({node, ...props}) => <a style={{color: '#0066cc'}} target="_blank" rel="noopener noreferrer" {...props} />
              }}
            >
              {msg.content}
            </ReactMarkdown>
            {msg.isError && (
              <div className="error-hint">
                <small>Check the console (F12) for details</small>
              </div>
            )}
          </div>
        ))}
        {loading && <div className="msg ai loading">flint is thinking</div>}
      </div>
      <form className="input-area" onSubmit={handleSend} autoComplete="off">
        <input
          type="text"
          placeholder="Type your idea or answer..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || prdComplete}
        />
      </form>
    </div>
  );
}
