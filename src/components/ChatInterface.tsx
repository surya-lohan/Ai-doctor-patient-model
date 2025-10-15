import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PatientInfo } from '@/lib/openai';
import { SessionReportData } from '@/components/SessionReport';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  patientInfo?: PatientInfo;
  createdAt: string;
  updatedAt: string;
}

interface ChatInterfaceProps {
  activeConversation: Conversation | null;
  onNewConversation: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  activeConversation,
  onNewConversation,
}) => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [patientTyping, setPatientTyping] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!activeConversation) return;
    
    try {
      const response = await fetch(`/api/conversations/${activeConversation.id}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    
    try {
      // Add user message to UI immediately for better UX
      const tempUserMessage: Message = {
        id: Date.now().toString(),
        content: inputMessage,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, tempUserMessage]);
      setInputMessage('');
      
      // Show patient typing indicator
      setPatientTyping(true);
      
      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: activeConversation?.id,
          message: tempUserMessage.content,
          patientInfo: activeConversation?.patientInfo,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      
      // Hide typing indicator
      setPatientTyping(false);
      
      // If this was a new conversation, update the active conversation
      if (!activeConversation) {
        onNewConversation();
      } else {
        // Update messages with the actual messages from the server
        setMessages(prev => {
          // Remove the temporary user message
          const filtered = prev.filter(m => m.id !== tempUserMessage.id);
          // Add the actual messages from the server
          return [...filtered, ...data.messages];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setPatientTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleEndConversation = async () => {
    if (!activeConversation || messages.length === 0) return;
    
    setIsGeneratingReport(true);
    
    try {
      // Navigate to the report page with the conversation ID
      router.push(`/report/${activeConversation.id}`);
    } catch (error) {
      console.error('Error navigating to report page:', error);
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with End Conversation button */}
      {activeConversation && messages.length > 0 && (
        <div className="p-2 flex justify-end border-b">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleEndConversation}
            disabled={isGeneratingReport}
            className="flex items-center"
          >
            {isGeneratingReport ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Generating Session Report...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                End Conversation
              </>
            )}
          </Button>
        </div>
      )}
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          {messages.length === 0 && !activeConversation && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <h3 className="text-2xl font-semibold mb-2">Welcome to Virtual Psychological Consultation</h3>
              <p className="text-muted-foreground mb-6">
                Start a new conversation to begin a session with a virtual psychological patient.
              </p>
              <Button onClick={onNewConversation}>
                Start New Consultation
              </Button>
            </div>
          )}
          
          {messages.length === 0 && activeConversation && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <h3 className="text-xl font-semibold mb-2">New Psychological Consultation</h3>
              <p className="text-muted-foreground mb-4">
                Introduce yourself and ask about the patient's concerns or feelings.
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } mb-4`}
            >
              <div
                className={`flex ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                } max-w-[80%]`}
              >
                <Avatar className={`h-8 w-8 ${
                  message.role === 'user' ? 'ml-2' : 'mr-2'
                }`}>
                  <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                    {message.role === 'user' ? 'DR' : 'PT'}
                  </div>
                </Avatar>
                <div>
                  <Card className={`p-3 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </Card>
                  <div className={`text-xs text-muted-foreground mt-1 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {formatTime(message.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {patientTyping && (
            <div className="flex justify-start mb-4">
              <div className="flex flex-row max-w-[80%]">
                <Avatar className="h-8 w-8 mr-2">
                  <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                    PT
                  </div>
                </Avatar>
                <Card className="p-3 bg-muted">
                  <p className="text-muted-foreground">Patient is typing...</p>
                </Card>
              </div>
            </div>
          )}
          
          {isGeneratingReport && (
            <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
              <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="text-lg font-medium">Preparing Session Report...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  You'll be redirected to the report page shortly...
                </p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </ScrollArea>
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;