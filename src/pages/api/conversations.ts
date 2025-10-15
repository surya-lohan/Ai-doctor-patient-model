import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/util/supabase/api';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the current user from Supabase
  const supabase = createClient(req);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Authentication error:', authError);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      // Get all conversations for the current user
      const conversations = await prisma.conversation.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Get only the last message for preview
          },
        },
      });

      return res.status(200).json({ conversations });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      // Create a new conversation
      const { title, patientInfo } = req.body;

      const conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          title: title || 'Psychological Consultation',
          patientInfo: patientInfo || {},
        },
      });

      return res.status(201).json({ conversation });
    } catch (error) {
      console.error('Error creating conversation:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}