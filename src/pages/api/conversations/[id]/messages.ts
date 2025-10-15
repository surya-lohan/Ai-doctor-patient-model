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

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Conversation ID is required' });
  }

  if (req.method === 'GET') {
    try {
      // First, verify the conversation belongs to the current user
      const conversation = await prisma.conversation.findUnique({
        where: { id },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      if (conversation.userId !== user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Get all messages for the conversation
      const messages = await prisma.message.findMany({
        where: { conversationId: id },
        orderBy: { createdAt: 'asc' },
      });

      return res.status(200).json({ messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}