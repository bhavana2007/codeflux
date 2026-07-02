import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader } from 'lucide-react';
import ChatBotService from '../services/ChatBotService';

const ChatBot = ({ onClose, context = {} }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Hey! I\'m Fluxy, your DSA buddy. What\'s up? Got questions about algorithms, the platform, or just wanna chat?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setError(null);

    try {
      // Use ChatBotService to get AI response
      const conversationHistory = messages.filter(m => m !== messages[0]); // Exclude initial greeting
      const response = await ChatBotService.sendMessage(userMessage, conversationHistory, context);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('ChatBot error:', error);
      const errorMessage = error.message?.includes('API key') 
        ? '⚠️ ChatBot is not configured yet. Please add an API key (OpenAI or Gemini) to enable AI responses.'
        : `Oops! 😅 ${error.message || 'Something went wrong'}. Want to try again?`;
      
      setError(error.message);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-end p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-sm h-[500px] flex flex-col border border-slate-700">
        {/* Header */}
        <div className="bg-blue-600 px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/codeflux-logo.png" 
              alt="CodeFlux" 
              className="w-8 h-8 rounded-full"
            />
            <div>
              <h3 className="text-white font-bold text-sm">Fluxy</h3>
              <p className="text-blue-100 text-xs">Your DSA Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-500 p-1 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
            >
              {msg.role === 'assistant' && <span className="text-lg">🤖</span>}
              <div
                className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-100'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && <span className="text-lg">👤</span>}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start items-center gap-2">
              <span className="text-lg">🤖</span>
              <div className="bg-slate-700 rounded-lg px-3 py-2 flex items-center gap-2">
                <Loader size={14} className="animate-spin text-blue-400" />
                <span className="text-slate-300 text-sm">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
