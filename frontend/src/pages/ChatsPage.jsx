import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatSidebar, MessageList, MessageComposer, NewChatModal, GroupMembersPanel } from '../components/chats';
import chatsApi from '../services/chatsApi';
import friendsApi from '../services/friendsApi';
import socketClient from '../services/socketClient';
import { useAuthStore } from '../state/authStore';

export default function ChatsPage() {
  const { user } = useAuthStore();
  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [chatDetails, setChatDetails] = useState(null);
  
  const typingTimeoutRef = useRef({});

  // Load chats and friends on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [chatsData, friendsData] = await Promise.all([
          chatsApi.getChats(),
          friendsApi.getFriends(),
        ]);
        setChats(chatsData || []);
        setFriends(friendsData || []);
      } catch (err) {
        setError(err.message || 'Failed to load chats');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Setup socket connection
  useEffect(() => {
    // Connect socket (token would come from auth)
    const token = localStorage.getItem('socket_token'); // This would be set during login
    if (token) {
      socketClient.connect(token);
    }

    return () => {
      socketClient.disconnect();
    };
  }, []);

  // Handle socket events
  useEffect(() => {
    const handleNewMessage = (data) => {
      if (data.chatId === selectedChatId) {
        // Add message to current chat
        setMessages(prev => [...prev, {
          id: data.id || Date.now().toString(),
          sender: { id: data.senderId, username: data.senderUsername },
          content: data.content,
          type: 'text',
          createdAt: data.timestamp || new Date().toISOString(),
        }]);
      }
      
      // Update chat list with new message
      setChats(prev => prev.map(chat => 
        chat.id === data.chatId 
          ? {
              ...chat,
              lastMessage: { content: data.content, senderId: data.senderId },
              lastMessageAt: data.timestamp || new Date().toISOString(),
              unreadCount: data.chatId === selectedChatId ? 0 : (chat.unreadCount || 0) + 1,
            }
          : chat
      ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)));
    };

    const handleUserTyping = (data) => {
      if (data.chatId === selectedChatId && data.userId !== user?.id) {
        setTypingUsers(prev => 
          prev.includes(data.userId) ? prev : [...prev, data.userId]
        );
        
        // Clear typing after timeout
        if (typingTimeoutRef.current[data.userId]) {
          clearTimeout(typingTimeoutRef.current[data.userId]);
        }
        typingTimeoutRef.current[data.userId] = setTimeout(() => {
          setTypingUsers(prev => prev.filter(id => id !== data.userId));
        }, 3000);
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (data.chatId === selectedChatId) {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
      }
    };

    const unsubMessage = socketClient.onNewMessage(handleNewMessage);
    const unsubTyping = socketClient.onUserTyping(handleUserTyping);
    const unsubStopTyping = socketClient.onUserStoppedTyping(handleUserStoppedTyping);

    return () => {
      unsubMessage();
      unsubTyping();
      unsubStopTyping();
      // Clear all typing timeouts
      Object.values(typingTimeoutRef.current).forEach(clearTimeout);
    };
  }, [selectedChatId, user?.id]);

  // Load messages when chat is selected
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      setChatDetails(null);
      setShowMembersPanel(false);
      return;
    }

    async function loadMessages() {
      try {
        setMessagesLoading(true);
        const [messagesData, chatData] = await Promise.all([
          chatsApi.getMessages(selectedChatId),
          chatsApi.getChat(selectedChatId),
        ]);
        setMessages(messagesData);
        setChatDetails(chatData);
        
        // Join socket room
        socketClient.joinChat(selectedChatId);
        
        // Mark as read in chat list
        setChats(prev => prev.map(chat =>
          chat.id === selectedChatId ? { ...chat, unreadCount: 0 } : chat
        ));
      } catch (err) {
        setError(err.message || 'Failed to load messages');
      } finally {
        setMessagesLoading(false);
      }
    }
    loadMessages();

    return () => {
      socketClient.leaveChat(selectedChatId);
    };
  }, [selectedChatId]);

  // Send message
  const handleSendMessage = useCallback(async (content) => {
    if (!selectedChatId) return;

    try {
      const message = await chatsApi.sendMessage(selectedChatId, content);
      setMessages(prev => [...prev, message]);
      
      // Update chat list
      setChats(prev => prev.map(chat =>
        chat.id === selectedChatId
          ? {
              ...chat,
              lastMessage: { content, senderId: user?.id },
              lastMessageAt: new Date().toISOString(),
            }
          : chat
      ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)));

      // Emit via socket for real-time
      socketClient.emitMessage(selectedChatId, content);
    } catch (err) {
      setError(err.message || 'Failed to send message');
    }
  }, [selectedChatId, user?.id]);

  // Handle typing indicator
  const handleTyping = useCallback((isTyping) => {
    if (!selectedChatId) return;
    
    if (isTyping) {
      socketClient.emitTyping(selectedChatId);
    } else {
      socketClient.emitStopTyping(selectedChatId);
    }
  }, [selectedChatId]);

  // Create direct chat
  const handleCreateDirectChat = useCallback(async (friendId) => {
    try {
      const chat = await chatsApi.getOrCreateDirectChat(friendId);
      // Reload chats and select the new one
      const chatsData = await chatsApi.getChats();
      setChats(chatsData);
      setSelectedChatId(chat.id);
    } catch (err) {
      setError(err.message || 'Failed to create chat');
    }
  }, []);

  // Create group chat
  const handleCreateGroupChat = useCallback(async (name, memberIds) => {
    try {
      const chat = await chatsApi.createGroupChat(name, memberIds);
      // Reload chats and select the new one
      const chatsData = await chatsApi.getChats();
      setChats(chatsData);
      setSelectedChatId(chat.id);
    } catch (err) {
      setError(err.message || 'Failed to create group chat');
    }
  }, []);

  // Get selected chat info
  const selectedChat = chats.find(c => c.id === selectedChatId);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <ChatSidebar
          chats={chats}
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
          onNewChat={() => setShowNewChatModal(true)}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-surface-900">
        {selectedChat ? (
          <>
            {/* Chat header */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-surface-700 bg-surface-800">
              <div className="flex items-center gap-3">
                {selectedChat.type === 'group' ? (
                  <div className="w-10 h-10 rounded-full bg-accent-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                ) : selectedChat.participants[0]?.avatarUrl ? (
                  <img
                    src={selectedChat.participants[0].avatarUrl}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-900/30 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-400">
                      {(selectedChat.participants[0]?.displayName || selectedChat.participants[0]?.username || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-white">
                    {selectedChat.type === 'group' 
                      ? selectedChat.name 
                      : selectedChat.participants[0]?.displayName || selectedChat.participants[0]?.username}
                  </h2>
                  {selectedChat.type === 'group' && (
                    <p className="text-sm text-gray-400">
                      {chatDetails?.members?.length || selectedChat.participants.length + 1} members
                    </p>
                  )}
                </div>
              </div>
              {/* Show members button for group chats */}
              {selectedChat.type === 'group' && (
                <button
                  onClick={() => setShowMembersPanel(!showMembersPanel)}
                  className={`p-2 rounded-lg transition-colors ${
                    showMembersPanel 
                      ? 'bg-primary-900/30 text-primary-400' 
                      : 'text-gray-400 hover:bg-surface-700 hover:text-white'
                  }`}
                  title={showMembersPanel ? 'Hide members' : 'Show members'}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Messages */}
            <MessageList
              messages={messages}
              typingUsers={typingUsers}
              isLoading={messagesLoading}
            />

            {/* Composer */}
            <MessageComposer
              onSend={handleSendMessage}
              onTyping={handleTyping}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-20 h-20 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium text-white mb-1">Select a chat</h3>
              <p>Choose a conversation from the sidebar or start a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* Group members panel */}
      {selectedChat?.type === 'group' && chatDetails?.members && (
        <GroupMembersPanel
          members={chatDetails.members}
          isOpen={showMembersPanel}
          onClose={() => setShowMembersPanel(false)}
          currentUserId={user?.id}
        />
      )}

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-900/20 border border-red-800 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <p className="text-sm text-red-400">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-400 hover:text-red-500"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* New chat modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        friends={friends}
        onCreateDirect={handleCreateDirectChat}
        onCreateGroup={handleCreateGroupChat}
      />
    </div>
  );
}
