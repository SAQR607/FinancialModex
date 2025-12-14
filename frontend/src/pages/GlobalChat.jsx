import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { messageService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const GlobalChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await messageService.getGlobalMessages();
      setMessages(data);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const setupSocket = () => {
    const token = localStorage.getItem('token');
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
    socketRef.current = io(socketUrl, {
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', 'global');
    });

    socketRef.current.on('global_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socketRef.current.on('error', (error) => {
      toast.error(error.message);
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await messageService.createMessage({
        is_global: true,
        message_text: newMessage
      });
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-modex-dark text-white p-4">
        <div className="container mx-auto flex items-center gap-3">
          <MessageSquare size={24} />
          <h1 className="text-2xl font-bold">Global Chat</h1>
          <span className="text-gray-300">Chat with all participants</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 container mx-auto max-w-4xl">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.user_id === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md p-4 rounded-lg ${
                  message.user_id === user.id
                    ? 'bg-modex-light text-white'
                    : 'bg-white text-gray-800 shadow-md'
                }`}
              >
                <p className="text-sm font-semibold mb-1">
                  {message.user?.full_name}
                </p>
                <p>{message.message_text}</p>
                <p className="text-xs mt-2 opacity-75">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={sendMessage} className="container mx-auto max-w-4xl flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="input-field flex-1"
            placeholder="Type a message..."
          />
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Send size={20} />
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default GlobalChat;

