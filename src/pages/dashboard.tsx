import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import ConversationSidebar from "@/components/ConversationSidebar";
import ChatInterface from "@/components/ChatInterface";
import PatientProfile from "@/components/PatientProfile";
import { PatientInfo } from "@/lib/openai";

interface Conversation {
  id: string;
  title: string;
  patientInfo?: PatientInfo;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const { signOut, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Handle theme toggle
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  const handleNewConversation = async () => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Patient Consultation',
          patientInfo: {
            age: Math.floor(Math.random() * 70) + 18, // Random age between 18-87
            gender: Math.random() > 0.5 ? 'Male' : 'Female',
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to create conversation');
      
      const data = await response.json();
      setActiveConversation(data.conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b p-4">
        <div className="container mx-auto flex flex-wrap justify-between items-center">
          <h1 className="text-2xl font-bold">Virtual Doctor</h1>
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isMounted && theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </Button>
            <Button
              onClick={() => {
                signOut();
              }}
              variant="outline"
              size="sm"
              className="md:text-base md:px-4 md:py-2"
            >
              Log Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile, shown on larger screens */}
        <div className="hidden md:block md:w-80 h-full">
          <ConversationSidebar
            activeConversationId={activeConversation?.id || null}
            onSelectConversation={setActiveConversation}
            onNewConversation={handleNewConversation}
          />
        </div>

        {/* Mobile Sidebar Button - Only shown on mobile */}
        <div className="md:hidden p-2 border-b">
          <Button 
            onClick={handleNewConversation}
            className="w-full"
          >
            Start New Consultation
          </Button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              activeConversation={activeConversation}
              onNewConversation={handleNewConversation}
            />
          </div>
        </div>

        {/* Patient Profile - Hidden on mobile, shown on larger screens */}
        <div className="hidden md:block md:w-80 h-full border-l p-4 overflow-y-auto">
          <PatientProfile patientInfo={activeConversation?.patientInfo} />
          
          {/* Doctor Profile */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Doctor Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl">
                  DR
                </div>
                <div>
                  <p className="font-medium">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.user_metadata?.name || 'Doctor'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}