import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Info } from 'lucide-react';

interface MHDAssistantProps {
  role: 'patient' | 'doctor' | 'admin' | 'hospital' | string;
  patientId?: string; // provided if available
}

export default function MHDAssistant({ role, patientId }: MHDAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    if (history.length === 0) {
      setHistory([
        {
          role: 'assistant',
          content: "Hello! I am the MHD Healthcare Assistant. How can I help you today? \n\n*Please note: I am an AI assistant and not a replacement for professional medical judgment.*"
        }
      ]);
    }
  }, [history]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isOpen]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage('');
    
    const newHistory = [...history, { role: 'user', content: userMessage } as const];
    setHistory(newHistory);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          context: { role, patientId },
          history: history
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      setHistory(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error(error);
      setHistory(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error connecting to the server. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#102A43] hover:bg-[#1F5F8B] text-white px-4 py-3 rounded-[6px] shadow-sm transition-colors border border-[#0d2235]"
        >
          <Bot className="w-5 h-5" />
          <span className="text-[14px] font-semibold">MHD Assistant</span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-[360px] bg-white border border-[#CBD5E1] rounded-[8px] shadow-lg flex flex-col h-[500px] max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="bg-[#102A43] text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-semibold text-[15px]">MHD Healthcare Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="bg-[#F4F6F8] px-3 py-2 border-b border-[#CBD5E1] flex items-start gap-2 shrink-0 text-[#52606D]">
             <Info className="w-4 h-4 mt-0.5 shrink-0" />
             <p className="text-[11px] leading-tight">
               This is an AI assistant to help you navigate and summarize information. It is not a replacement for professional medical judgment.
             </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F4F6F8]">
            {history.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-[6px] p-3 text-[13px] ${
                    msg.role === 'user' 
                      ? 'bg-[#1F5F8B] text-white' 
                      : 'bg-white border border-[#CBD5E1] text-[#172B3A]'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-[#52606D] mt-1 mx-1">
                  {msg.role === 'user' ? 'You' : 'MHD Assistant'}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-white border border-[#CBD5E1] rounded-[6px] p-3">
                  <Loader2 className="w-4 h-4 text-[#1F5F8B] animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-[#CBD5E1] shrink-0">
            <div className="relative flex items-center">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[6px] pl-3 pr-10 py-2.5 text-[13px] focus:outline-none focus:border-[#1F5F8B] resize-none h-[42px] leading-[20px]"
                rows={1}
              />
              <button 
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="absolute right-2 text-[#1F5F8B] disabled:text-[#CBD5E1] hover:text-[#102A43] transition-colors p-1"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
