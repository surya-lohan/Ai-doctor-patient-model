import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/util/supabase/api';
import prisma from '@/lib/prisma';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    // Get the conversation and all its messages
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { 
        messages: {
          orderBy: { createdAt: 'asc' }
        } 
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Verify the conversation belongs to the current user
    if (conversation.userId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Calculate session duration
    const startTime = new Date(conversation.createdAt);
    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.round(durationMs / 60000);
    
    // Format duration as hours and minutes
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    let sessionDuration = '';
    
    if (hours > 0) {
      sessionDuration += `${hours} hour${hours > 1 ? 's' : ''}`;
      if (minutes > 0) sessionDuration += ` and `;
    }
    if (minutes > 0 || hours === 0) {
      sessionDuration += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    // Format messages for OpenAI
    const formattedMessages = conversation.messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Create the system prompt for the report generation
    const systemPrompt = `
You are an expert psychological assessment AI that analyzes conversations between doctors and patients.
Your task is to generate a comprehensive session report based on the conversation transcript.

The report should include:
1. A summary of the key points discussed in the conversation
2. Emotions detected in the patient's responses
3. Your analysis of the patient's condition based on their responses
4. Identification of the doctor's diagnosis or assessment (if any)
5. Your professional feedback on whether the doctor's diagnosis seems accurate, partially accurate, or not consistent with the patient's symptoms
6. Optional suggested questions for future sessions

Important guidelines:
- Be objective and clinical in your analysis
- Focus on the content of the conversation, not the format
- Identify emotional patterns and significant disclosures
- Evaluate the doctor's approach and diagnosis accuracy
- Provide constructive feedback that would help the doctor improve
- Be specific about why a diagnosis is accurate or not
- If no clear diagnosis was made by the doctor, note this fact

The patient has the following profile:
${JSON.stringify(conversation.patientInfo, null, 2)}

Please format your response as a JSON object with the following structure:
{
  "summaryOfDiscussion": "string",
  "emotionsDetected": ["string", "string"],
  "aiAnalysis": "string",
  "doctorDiagnosis": "string",
  "diagnosisFeedback": {
    "status": "accurate" | "partially accurate" | "not consistent",
    "explanation": "string"
  },
  "suggestedQuestions": ["string", "string"]
}
`;

    // Generate the report using OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...formattedMessages
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    // Parse the response
    const reportContent = JSON.parse(response.choices[0].message.content || '{}');

    // Combine with patient info and session duration
    const fullReport = {
      patientInfo: conversation.patientInfo,
      sessionDuration,
      ...reportContent
    };

    // Return the report
    return res.status(200).json(fullReport);
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}