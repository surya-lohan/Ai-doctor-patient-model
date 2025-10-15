import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PatientInfo } from '@/lib/openai';

interface Conversation {
  id: string;
  title: string;
  patientInfo?: PatientInfo;
  createdAt: string;
  updatedAt: string;
  messages?: {
    content: string;
    role: string;
    createdAt: string;
  }[];
}

interface ConversationSidebarProps {
  activeConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  activeConversationId,
  onSelectConversation,
  onNewConversation,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="h-full flex flex-col border-r">
      <div className="p-4">
        <Button 
          onClick={onNewConversation} 
          className="w-full"
        >
          New Consultation
        </Button>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No conversations yet
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 rounded-md cursor-pointer mb-1 hover:bg-muted transition-colors ${
                  activeConversationId === conversation.id ? 'bg-muted' : ''
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="font-medium truncate">{conversation.title}</div>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>
                    {conversation.messages && conversation.messages[0] 
                      ? conversation.messages[0].content.substring(0, 30) + '...'
                      : 'No messages'}
                  </span>
                  <span>{formatDate(conversation.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ConversationSidebar;