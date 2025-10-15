import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/util/supabase/api';
import prisma from '@/lib/prisma';
import { generatePatientResponse, PatientInfo } from '@/lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the current user from Supabase
    const supabase = createClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { conversationId, message, patientInfo } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // If no conversationId is provided, create a new conversation
    let conversation;
    if (!conversationId) {
      // For new conversations, we'll generate a random psychological patient
      // The patientInfo will be generated in the generatePatientResponse function
      conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          title: 'Psychological Consultation',
          patientInfo: patientInfo || {},
        },
      });
      console.log('Created new conversation:', conversation.id);
    } else {
      // Get the existing conversation
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: true },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      // Verify the conversation belongs to the current user
      if (conversation.userId !== user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    // Save the user's message to the database
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: message,
        role: 'user',
      },
    });

    // Get all messages for this conversation to maintain context
    const allMessages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
    });

    // Format messages for OpenAI
    const formattedMessages = allMessages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Generate AI response
    const aiResponse = await generatePatientResponse(
      formattedMessages,
      conversation.patientInfo as PatientInfo
    );

    // If this is a new conversation, update the conversation with the generated patient info
    if (!patientInfo || Object.keys(patientInfo).length === 0) {
      // Extract patient info from the AI's system context
      // This is a bit of a hack, but it works for now
      // In a production app, you might want to return this info directly from generatePatientResponse
      const updatedPatientInfo = conversation.patientInfo;
      
      // Save the AI response to the database
      const assistantMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: aiResponse || 'Sorry, I could not generate a response.',
          role: 'assistant',
        },
      });

      // Return the conversation and messages
      return res.status(200).json({
        conversation: {
          ...conversation,
          patientInfo: updatedPatientInfo
        },
        messages: [userMessage, assistantMessage],
      });
    }

    // Save the AI response to the database
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: aiResponse || 'Sorry, I could not generate a response.',
        role: 'assistant',
      },
    });

    // Return the conversation and messages
    return res.status(200).json({
      conversation,
      messages: [userMessage, assistantMessage],
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}