import React from "react";
import Head from "next/head";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useRouter } from "next/router";
import { ArrowRight, MessageSquare, Brain, Activity, Users } from "lucide-react";

export default function Home() {
  const router = useRouter();
  
  return (
    <>
      <Head>
        <title>Virtual Doctor - AI-Powered Patient Simulation</title>
        <meta name="description" content="Practice your diagnostic skills with our AI-powered virtual patient simulation system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-20 px-4 md:px-6 lg:px-8">
            <div className="container mx-auto max-w-6xl">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                    AI-Powered <span className="text-primary">Virtual Patient</span> Simulation
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    Practice your diagnostic skills with realistic AI patients that respond naturally to your questions and exhibit authentic symptoms.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg" 
                      onClick={() => router.push('/signup')}
                      className="gap-2"
                    >
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      onClick={() => router.push('/login')}
                    >
                      Log In
                    </Button>
                  </div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="relative w-full max-w-md aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MessageSquare className="h-32 w-32 text-primary/40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 px-4 md:px-6 lg:px-8 bg-muted/50">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card>
                  <CardHeader>
                    <Brain className="h-12 w-12 text-primary mb-4" />
                    <CardTitle>AI-Powered Patients</CardTitle>
                    <CardDescription>
                      Our virtual patients use advanced AI to simulate realistic symptoms and emotional responses.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <MessageSquare className="h-12 w-12 text-primary mb-4" />
                    <CardTitle>Natural Conversations</CardTitle>
                    <CardDescription>
                      Engage in realistic doctor-patient dialogues with context-aware responses.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <Activity className="h-12 w-12 text-primary mb-4" />
                    <CardTitle>Track Your Progress</CardTitle>
                    <CardDescription>
                      Monitor your diagnostic performance and improve your clinical skills over time.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-4 md:px-6 lg:px-8">
            <div className="container mx-auto max-w-4xl text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to improve your diagnostic skills?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of medical professionals using Virtual Doctor to enhance their clinical reasoning.
              </p>
              <Button 
                size="lg" 
                onClick={() => router.push('/signup')}
                className="gap-2"
              >
                Create Your Account <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
