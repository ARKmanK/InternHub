import { supabase } from '@/supabaseClient';

export const addMessage = async (userId: number, text: string): Promise<{ id: number } | null> => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      user_id: userId,
      text,
      timestamp: new Date().toISOString(),
      is_read: false,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to add message: ${error.message}`);
  }

  return data || null;
};

export const getMessagesByUserId = async (
  userId: number,
  limit: number = 10,
  offset: number = 0
) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
};

export const deleteMessage = async (messageId: number) => {
  const { error } = await supabase.from('messages').delete().eq('id', messageId);

  if (error) throw error;
};

export const getUnreadMessagesCount = async (userId: number) => {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
};

export const markMessageAsRead = async (messageId: number) => {
  const { data, error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', messageId)
    .select();

  if (error) throw error;
  return data;
};
