import React, { useEffect, useState, useRef } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Send } from 'lucide-react';
import { Input } from '../ui/input';

export default function ChatContainer({ projectId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data } = await api.get(`/projects/${projectId}/messages`);
      setMessages(data);
    } catch {}
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await api.post(`/projects/${projectId}/messages`, { message: text.trim() });
      setText('');
      await loadMessages();
    } catch {}
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[400px] border border-white/10 bg-[#0B1325]" data-testid="chat-container">
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="text-sm text-[#F8FAFC] font-medium">Project Chat</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-8">No messages yet. Start the conversation.</p>
        )}
        {messages.map((m) => {
          const isOwn = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`} data-testid={`message-${m.id}`}>
              <div className={`max-w-[75%] px-3 py-2 text-sm ${
                isOwn
                  ? 'bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 text-slate-200'
                  : 'bg-white/5 border border-white/10 text-slate-300'
              }`}>
                <p className="text-xs text-slate-500 mb-1 font-mono">{m.sender_name} ({m.sender_role})</p>
                <p>{m.message}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={sendMessage} className="px-4 py-3 border-t border-white/10 flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-sm"
          data-testid="chat-message-input"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-[#FF6B6B] hover:bg-[#ff5252] text-white p-2.5 transition-colors disabled:opacity-50"
          data-testid="chat-send-button"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
