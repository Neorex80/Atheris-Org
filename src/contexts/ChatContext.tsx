import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { ChatMessage } from '../types';

// Define types
export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastMessage: string;
  updatedAt: number;
  starred: boolean;
  folderId?: string;
}

export interface ChatFolder {
  id: string;
  name: string;
  isExpanded: boolean;
}

interface ChatContextType {
  conversations: Conversation[];
  folders: ChatFolder[];
  currentConversationId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingMessageId: string | null;
  
  setCurrentConversationId: (id: string | null) => void;
  createNewConversation: () => string;
  deleteConversation: (id: string) => void;
  starConversation: (id: string, starred: boolean) => void;
  updateConversationTitle: (id: string, title: string) => void;
  moveConversationToFolder: (conversationId: string, folderId: string | null) => void;
  
  createFolder: (name: string) => string;
  deleteFolder: (id: string) => void;
  renameFolder: (id: string, name: string) => void;
  toggleFolderExpanded: (id: string) => void;
  
  sendMessage: (content: string, useReasoning?: boolean) => Promise<void>;
  regenerateMessage: (messageId: string) => void;
  deleteCurrentConversation: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Helper function to generate a basic conversation title from message content
const generateTitleFromContent = (content: string): string => {
  const title = content.trim().replace(/[#*_~`]/g, '');
  const firstLine = title.split('\n')[0];
  const truncated = firstLine.substring(0, 40);
  return truncated.length < firstLine.length ? `${truncated}...` : truncated;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [folders, setFolders] = useState<ChatFolder[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    try {
      // Load conversations
      const savedConversations = localStorage.getItem('conversations');
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations));
      }
      
      // Load folders
      const savedFolders = localStorage.getItem('folders');
      if (savedFolders) {
        setFolders(JSON.parse(savedFolders));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, []);

  // Save data when changed
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    if (folders.length > 0) {
      localStorage.setItem('folders', JSON.stringify(folders));
    }
  }, [folders]);

  // Load messages when current conversation changes
  useEffect(() => {
    if (currentConversationId) {
      const conversation = conversations.find(c => c.id === currentConversationId);
      if (conversation) {
        setMessages(conversation.messages || []);
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [currentConversationId, conversations]);

  // Create a new conversation
  const createNewConversation = () => {
    const id = uuidv4();
    const newConversation: Conversation = {
      id,
      title: 'New Chat',
      messages: [],
      lastMessage: '',
      updatedAt: Date.now(),
      starred: false
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(id);
    setMessages([]);
    
    return id;
  };

  // Delete a conversation
  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    
    if (currentConversationId === id) {
      const nextConversation = conversations.find(c => c.id !== id);
      setCurrentConversationId(nextConversation?.id || null);
    }
    
    toast.success('Conversation deleted');
  };

  // Delete the current conversation
  const deleteCurrentConversation = () => {
    if (currentConversationId) {
      deleteConversation(currentConversationId);
    }
  };

  // Star/unstar a conversation
  const starConversation = (id: string, starred: boolean) => {
    setConversations(prev => 
      prev.map(c => c.id === id ? { ...c, starred, updatedAt: Date.now() } : c)
    );
    
    toast.success(starred ? 'Conversation starred' : 'Conversation unstarred');
  };

  // Update conversation title
  const updateConversationTitle = (id: string, title: string) => {
    setConversations(prev => 
      prev.map(c => c.id === id ? { ...c, title, updatedAt: Date.now() } : c)
    );
  };

  // Move conversation to folder
  const moveConversationToFolder = (conversationId: string, folderId: string | null) => {
    setConversations(prev => 
      prev.map(c => c.id === conversationId ? { ...c, folderId, updatedAt: Date.now() } : c)
    );
    
    toast.success(folderId ? 'Moved to folder' : 'Removed from folder');
  };

  // Create a new folder
  const createFolder = (name: string) => {
    const id = uuidv4();
    const newFolder: ChatFolder = {
      id,
      name,
      isExpanded: true
    };
    
    setFolders(prev => [...prev, newFolder]);
    toast.success('Folder created');
    return id;
  };

  // Delete a folder
  const deleteFolder = (id: string) => {
    // Move all conversations in this folder back to root
    setConversations(prev => 
      prev.map(c => c.folderId === id ? { ...c, folderId: undefined } : c)
    );
    
    // Remove the folder
    setFolders(prev => prev.filter(f => f.id !== id));
    toast.success('Folder deleted');
  };

  // Rename a folder
  const renameFolder = (id: string, name: string) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f));
    toast.success('Folder renamed');
  };

  // Toggle folder expanded state
  const toggleFolderExpanded = (id: string) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, isExpanded: !f.isExpanded } : f));
  };

  // Send a message in the current conversation
  const sendMessage = async (content: string, useReasoning: boolean = false) => {
    if (!content.trim()) return;
    
    // Create a conversation if none is selected
    let activeConversationId = currentConversationId;
    if (!activeConversationId) {
      activeConversationId = createNewConversation();
    }
    
    // Create user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: Date.now()
    };
    
    // Add to messages
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Find current conversation
    const currentConversation = conversations.find(c => c.id === activeConversationId);
    const isFirstMessage = !currentConversation || currentConversation.messages.length === 0;
    
    // Update conversation with user message
    setConversations(prev => 
      prev.map(c => c.id === activeConversationId 
        ? { ...c, messages: updatedMessages, lastMessage: content, updatedAt: Date.now() } 
        : c
      )
    );
    
    // Generate title if first message
    if (isFirstMessage) {
      const title = generateTitleFromContent(content);
      setConversations(prev => 
        prev.map(c => c.id === activeConversationId ? { ...c, title } : c)
      );
    }
    
    // Begin AI response
    setIsLoading(true);
    
    try {
      // Create placeholder for assistant message
      const assistantMessageId = uuidv4();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        content: '',
        role: 'assistant',
        timestamp: Date.now(),
        reasoning: useReasoning ? '' : undefined
      };
      
      // Add empty message for streaming
      const withAssistantMessage = [...updatedMessages, assistantMessage];
      setMessages(withAssistantMessage);
      setStreamingMessageId(assistantMessageId);
      setIsStreaming(true);
      setIsLoading(false);
      
      // Simulate response - replace with actual API call in production
      const responseText = "This is a simulated response. I will help you with your request about " + content.slice(0, 30) + "...";
      let currentText = '';
      
      for (let i = 0; i < responseText.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 30));
        currentText += responseText[i];
        
        setMessages(prev => 
          prev.map(msg => msg.id === assistantMessageId ? { ...msg, content: currentText } : msg)
        );
      }
      
      // Update conversation with completed response
      const finalMessages = [...updatedMessages, { ...assistantMessage, content: responseText }];
      setConversations(prev => 
        prev.map(c => c.id === activeConversationId 
          ? { 
              ...c, 
              messages: finalMessages,
              lastMessage: `AI: ${responseText.substring(0, 30)}...`,
              updatedAt: Date.now() 
            } 
          : c
        )
      );
      
    } catch (error) {
      console.error('Error in AI response:', error);
      toast.error('Failed to get AI response');
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: "I'm having trouble responding. Please try again later.",
        role: 'assistant',
        timestamp: Date.now()
      };
      
      const finalMessages = [...updatedMessages, errorMessage];
      setConversations(prev => 
        prev.map(c => c.id === activeConversationId 
          ? { 
              ...c, 
              messages: finalMessages,
              lastMessage: 'Error: Connection issue',
              updatedAt: Date.now()
            } 
          : c
        )
      );
      
    } finally {
      setIsStreaming(false);
      setStreamingMessageId(null);
      setIsLoading(false);
    }
  };

  // Regenerate an AI message
  const regenerateMessage = (messageId: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex !== -1 && messages[messageIndex].role === 'assistant') {
      // Get the user message that preceded this assistant message
      const userMessageIndex = messageIndex - 1;
      
      if (userMessageIndex >= 0 && messages[userMessageIndex].role === 'user') {
        // Remove the current assistant message
        const updatedMessages = messages.slice(0, messageIndex);
        setMessages(updatedMessages);
        
        // Update the conversation
        if (currentConversationId) {
          setConversations(prev => 
            prev.map(c => c.id === currentConversationId 
              ? { ...c, messages: updatedMessages, updatedAt: Date.now() } 
              : c
            )
          );
        }
        
        // Check if the message had reasoning previously
        const hasReasoning = messages[messageIndex].reasoning !== undefined;
        
        // Resend the user message
        sendMessage(messages[userMessageIndex].content, hasReasoning);
        toast.success('Regenerating response...');
      } else {
        toast.error('Cannot regenerate this message');
      }
    }
  };

  const contextValue: ChatContextType = {
    conversations,
    folders,
    currentConversationId,
    messages,
    isLoading,
    isStreaming,
    streamingMessageId,
    
    setCurrentConversationId,
    createNewConversation,
    deleteConversation,
    starConversation,
    updateConversationTitle,
    moveConversationToFolder,
    
    createFolder,
    deleteFolder,
    renameFolder,
    toggleFolderExpanded,
    
    sendMessage,
    regenerateMessage,
    deleteCurrentConversation
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;