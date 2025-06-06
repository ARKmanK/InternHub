import { supabase } from '@/supabaseClient';
import { TypeTaskActivity } from '@/src/types/TypeTaskActivity';
import { TypeTaskSubmission } from '@/src/types/TypeTaskSubmission';

export const addTaskActivity = async (
  activity: Omit<TypeTaskActivity, 'id' | 'created_at'>
): Promise<{ error: Error | null }> => {
  const { error } = await supabase.from('task_activity').insert([activity]);
  return { error: error || null };
};

export const getTaskActivity = async (taskId: number): Promise<TypeTaskActivity[]> => {
  const { data, error } = await supabase
    .from('task_activity')
    .select(
      'id, task_id, user_id, status, username, activity_date, created_at, url, archive_url, photo_urls, comment'
    )
    .eq('task_id', taskId);
  if (error) {
    throw new Error(`Failed to fetch task activity: ${error.message}`);
  }
  return data.map(item => ({
    id: item.id,
    task_id: item.task_id,
    user_id: item.user_id,
    status: item.status,
    username: item.username || 'Неизвестно',
    activity_date: item.activity_date,
    created_at: item.created_at,
    url: item.url,
    archive_url: item.archive_url || null,
    photo_urls: item.photo_urls || [],
    comment: item.comment || null,
  }));
};

export const submitTaskSolution = async (
  submission: Omit<TypeTaskSubmission, 'id' | 'submitted_at'>
): Promise<void> => {
  const { error } = await supabase.from('task_submissions').insert([submission]);

  if (error) {
    throw new Error(`Failed to submit task solution: ${error.message}`);
  }
};

export const getTaskSubmissions = async (
  taskId: number,
  userId: number
): Promise<TypeTaskSubmission[]> => {
  const { data, error } = await supabase
    .from('task_submissions')
    .select('*')
    .eq('task_id', taskId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch task submissions: ${error.message}`);
  }

  return data;
};