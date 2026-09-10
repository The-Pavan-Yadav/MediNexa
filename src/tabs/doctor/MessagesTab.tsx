import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, 
  Search, 
  Send, 
  Paperclip, 
  UserCircle, 
  FileText, 
  Clock, 
  Activity,
  AlertCircle,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, orderBy, onSnapshot, getDoc, setDoc } from 'firebase/firestore';

interface ConversationType {
  id: string;
  patientId: string;
  patientName: string;
  patientMhdId: string;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
  participants: string[];
}

interface MessageType {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
  isClinicalUpdate?: boolean;
  hasAttachment?: boolean;
}

export default function MessagesTab({ doctorData, setActiveTab }: { doctorData: any, setActiveTab?: any }) {
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isClinicalUpdate, setIsClinicalUpdate] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Listen to conversations where doctor is a participant
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      let fetched: ConversationType[] = [];
      
      

      snapshot.forEach(docSnap => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as ConversationType);
      });
      
      fetched.sort((a, b) => {
        const timeA = a.lastMessageTime?.toMillis() || 0;
        const timeB = b.lastMessageTime?.toMillis() || 0;
        return timeB - timeA;
      });
      
      setConversations(fetched);
      setLoadingConv(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', activeConversation.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let fetched: MessageType[] = [];
      snapshot.forEach(docSnap => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as MessageType);
      });
      setMessages(fetched);
      setLoadingMessages(false);
      scrollToBottom();
      
      // If we are opening a conversation, clear unread count (assuming doctor is reading it)
      if (activeConversation.unreadCount > 0) {
        updateDoc(doc(db, 'conversations', activeConversation.id), {
          unreadCount: 0
        });
      }
    });

    return () => unsubscribe();
  }, [activeConversation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !auth.currentUser) return;

    setIsSending(true);
    const text = newMessage;
    const isClinical = isClinicalUpdate;
    
    setNewMessage('');
    setIsClinicalUpdate(false);

    try {
      // Add message
      await addDoc(collection(db, 'messages'), {
        conversationId: activeConversation.id,
        senderId: auth.currentUser.uid,
        text: text,
        timestamp: serverTimestamp(),
        isClinicalUpdate: isClinical
      });

      // Update conversation
      await updateDoc(doc(db, 'conversations', activeConversation.id), {
        lastMessage: isClinical ? `Clinical Update: ${text}` : text,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Setting unread count to 1 for the other participant (simplified)
      });
      
      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.patientMhdId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || 
                          (filterType === 'Unread' && c.unreadCount > 0);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-[1200px] mx-auto h-[calc(100vh-140px)] flex animate-in fade-in duration-200">
      
      {/* Left Panel: Conversations List */}
      <div className="w-[320px] lg:w-[360px] bg-[#FFFFFF] border border-[#CBD5E1] rounded-l-[4px] flex flex-col shrink-0">
        
        {/* Header & Search */}
        <div className="p-4 border-b border-[#CBD5E1] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-[#172B3A] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#102A43]" /> Clinical Inbox
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setFilterType('All')}
                className={`text-[12px] font-bold px-2 py-1 rounded-[4px] transition-colors ${filterType === 'All' ? 'bg-[#EBF1F6] text-[#1F5F8B]' : 'text-[#52606D] hover:bg-[#F4F6F8]'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilterType('Unread')}
                className={`text-[12px] font-bold px-2 py-1 rounded-[4px] transition-colors ${filterType === 'Unread' ? 'bg-[#EBF1F6] text-[#1F5F8B]' : 'text-[#52606D] hover:bg-[#F4F6F8]'}`}
              >
                Unread
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2 w-4 h-4 text-[#52606D]" />
            <input 
              type="text" 
              placeholder="Search patient or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-1.5 text-[13px] focus:outline-none focus:border-[#1F5F8B]"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loadingConv ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-[#1F5F8B]" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[13px] text-[#52606D] font-medium">No conversations found.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#CBD5E1]">
              {filteredConversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full text-left p-4 hover:bg-[#F9FAFB] transition-colors flex items-start gap-3 ${activeConversation?.id === conv.id ? 'bg-[#F4F6F8]' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#EBF1F6] border border-[#CBD5E1] flex items-center justify-center shrink-0">
                    <UserCircle className="w-6 h-6 text-[#1F5F8B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className={`text-[14px] truncate ${conv.unreadCount > 0 ? 'font-bold text-[#172B3A]' : 'font-semibold text-[#172B3A]'}`}>
                        {conv.patientName}
                      </p>
                      <span className="text-[11px] text-[#52606D] whitespace-nowrap ml-2">
                        {formatDate(conv.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#102A43] text-white text-[9px] px-1.5 py-0.5 rounded-[2px] font-bold uppercase tracking-wider">
                        {conv.patientMhdId}
                      </span>
                      <p className={`text-[12px] truncate ${conv.unreadCount > 0 ? 'font-semibold text-[#1F5F8B]' : 'text-[#52606D]'}`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="w-2.5 h-2.5 bg-[#B42318] rounded-full shrink-0 mt-1.5"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Active Conversation */}
      <div className="flex-1 bg-[#F9FAFB] border-y border-r border-[#CBD5E1] rounded-r-[4px] flex flex-col min-w-0">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="h-[64px] bg-[#FFFFFF] border-b border-[#CBD5E1] flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EBF1F6] border border-[#CBD5E1] flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-[#1F5F8B]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#172B3A] leading-none">{activeConversation.patientName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-mono font-medium text-[#52606D]">{activeConversation.patientMhdId}</span>
                    <span className="w-1 h-1 rounded-full bg-[#CBD5E1]"></span>
                    <span className="text-[11px] text-[#276749] font-medium flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-[#48BB78] rounded-full"></div> Secure Connection
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-[#52606D] hover:bg-[#F4F6F8] rounded-[4px] transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {loadingMessages ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1F5F8B]" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                  <Activity className="w-8 h-8 text-[#52606D] mb-3" />
                  <p className="text-[14px] font-medium text-[#172B3A]">No messages yet</p>
                  <p className="text-[13px] text-[#52606D]">Start a secure clinical conversation.</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.senderId === auth.currentUser?.uid;
                  
                  // Add date separators (simplified for example)
                  const showDate = index === 0 || formatDate(msg.timestamp) !== formatDate(messages[index-1].timestamp);

                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="text-[11px] font-semibold text-[#52606D] uppercase tracking-wider bg-[#F4F6F8] border border-[#CBD5E1] px-3 py-1 rounded-full">
                            {formatDate(msg.timestamp)}
                          </span>
                        </div>
                      )}
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {msg.isClinicalUpdate ? (
                          // Clinical Update Styling
                          <div className={`max-w-[75%] bg-[#FFFFFF] border ${isMe ? 'border-[#90CDF4]' : 'border-[#CBD5E1]'} rounded-[4px] overflow-hidden shadow-sm`}>
                            <div className={`px-3 py-1.5 flex items-center gap-1.5 border-b ${isMe ? 'bg-[#EBF1F6] border-[#90CDF4]' : 'bg-[#F4F6F8] border-[#CBD5E1]'}`}>
                              <AlertCircle className={`w-3.5 h-3.5 ${isMe ? 'text-[#1F5F8B]' : 'text-[#52606D]'}`} />
                              <span className={`text-[11px] font-bold uppercase tracking-wider ${isMe ? 'text-[#1F5F8B]' : 'text-[#52606D]'}`}>
                                Clinical Update
                              </span>
                            </div>
                            <div className="p-3 text-[13px] text-[#172B3A] leading-relaxed">
                              {msg.text}
                            </div>
                            <div className={`px-3 pb-2 text-[10px] text-right ${isMe ? 'text-[#1F5F8B]' : 'text-[#52606D]'}`}>
                              {formatTime(msg.timestamp)}
                            </div>
                          </div>
                        ) : (
                          // Standard Message Styling
                          <div className={`max-w-[70%] rounded-[4px] px-4 py-2.5 ${
                            isMe 
                              ? 'bg-[#102A43] text-white rounded-br-none' 
                              : 'bg-[#FFFFFF] border border-[#CBD5E1] text-[#172B3A] rounded-bl-none shadow-sm'
                          }`}>
                            <p className="text-[13px] leading-relaxed">{msg.text}</p>
                            <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-[#CBD5E1]' : 'text-[#52606D]'}`}>
                              {formatTime(msg.timestamp)}
                            </div>
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-[#FFFFFF] border-t border-[#CBD5E1] p-4 shrink-0">
              <form onSubmit={handleSendMessage} className="space-y-3">
                
                {/* Clinical Toggle */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="relative inline-block w-8 h-4">
                      <input 
                        type="checkbox" 
                        className="peer sr-only" 
                        checked={isClinicalUpdate}
                        onChange={(e) => setIsClinicalUpdate(e.target.checked)}
                      />
                      <div className="w-8 h-4 bg-[#CBD5E1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1F5F8B]"></div>
                    </div>
                    <span className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider flex items-center gap-1">
                      Mark as Clinical Update <AlertCircle className="w-3.5 h-3.5" />
                    </span>
                  </label>
                </div>

                <div className="flex items-end gap-2">
                  <button type="button" className="p-2.5 text-[#52606D] hover:bg-[#F4F6F8] border border-transparent hover:border-[#CBD5E1] rounded-[4px] transition-colors shrink-0">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <div className="flex-1 bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] overflow-hidden focus-within:border-[#1F5F8B] focus-within:ring-1 focus-within:ring-[#1F5F8B] transition-all">
                    <textarea 
                      rows={1}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Type a secure message..."
                      className="w-full bg-transparent px-3 py-2.5 text-[13px] text-[#172B3A] resize-none outline-none max-h-[120px]"
                      style={{ minHeight: '44px' }}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="bg-[#102A43] text-white p-2.5 rounded-[4px] hover:bg-[#173F5F] transition-colors border border-[#102A43] disabled:opacity-50 shrink-0 flex items-center justify-center"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
            <MessageSquare className="w-12 h-12 text-[#CBD5E1] mb-4" strokeWidth={1} />
            <h3 className="text-[18px] font-semibold text-[#172B3A] mb-1">Secure Messaging</h3>
            <p className="text-[13px] text-[#52606D]">Select a patient conversation to view history or send a message.</p>
          </div>
        )}
      </div>
    </div>
  );
}
