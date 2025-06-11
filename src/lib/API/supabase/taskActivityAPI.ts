import { supabase } from '@/supabaseClient';
import { TypeTaskActivity } from '@/src/types/TypeTaskActivity';
import { TypeTaskSubmission } from '@/src/types/TypeTaskSubmission';
import { addToStarted } from '@/src/data/userData';
import { uploadFileAndCreateRecord } from './filesAPI';
import { getUserId } from './userAPI';

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

export const submitTaskActivity = async (
  taskId: string,
  url: string,
  comment: string | null,
  zip: File[],
  images: File[],
  addNotification: (type: 'success' | 'error', title: string, message: string) => void,
  loadData: () => Promise<void>
): Promise<void> => {
  const currentUserId = getUserId();
  if (!currentUserId) {
    addNotification('error', 'Ошибка', 'Пользователь не авторизован');
    throw new Error('Пользователь не авторизован');
  }

  try {
    const firstName = localStorage.getItem('first_name') || 'User';
    const lastNameInitial = localStorage.getItem('last_name')?.charAt(0) || '';
    const username = `${firstName} ${lastNameInitial}.`;

    // Create new activity record
    const activityData: Omit<TypeTaskActivity, 'id' | 'created_at'> = {
      task_id: Number(taskId),
      user_id: currentUserId,
      status: 'verifying',
      username,
      activity_date: new Date().toISOString().split('T')[0],
      url,
      comment: comment || null,
      archive_url: null,
      photo_urls: [],
    };

    const { data: activityDataResult, error: activityError } = await supabase
      .from('task_activity')
      .insert(activityData)
      .select()
      .single();
    if (activityError) {
      addNotification('error', 'Ошибка', `Не удалось отправить решение: ${activityError.message}`);
      throw new Error(`Не удалось отправить решение: ${activityError.message}`);
    }

    const taskActivityId = activityDataResult.id;

    // Upload archive if present
    let archiveUrl: string | null = null;
    if (zip.length > 0) {
      archiveUrl = await uploadFileAndCreateRecord(taskActivityId, zip[0], 'archive');
    }

    // Upload images if present
    const photoUrls: string[] = [];
    if (images.length > 0) {
      for (const image of images) {
        const photoUrl = await uploadFileAndCreateRecord(taskActivityId, image, 'image');
        photoUrls.push(photoUrl);
      }
    }

    // Update activity with file URLs
    const { error: updateError } = await supabase
      .from('task_activity')
      .update({
        archive_url: archiveUrl,
        photo_urls: photoUrls,
      })
      .eq('id', taskActivityId);

    if (updateError) {
      addNotification('error', 'Ошибка', `Не удалось обновить запись: ${updateError.message}`);
      throw new Error(`Не удалось обновить запись: ${updateError.message}`);
    }

    const { data: existing } = await supabase
    .from('user_tasks')
    .select('is_favorite')
    .eq('user_id', currentUserId)
    .eq('task_id', Number(taskId))
    .single();

    const isFavorite = existing ? existing.is_favorite : false;

    const { error: userTaskError } = await supabase.from('user_tasks').upsert(
      {
        user_id: currentUserId,
        task_id: Number(taskId),
        is_favorite: isFavorite,
        is_started: true,
      },
      {
        onConflict: 'user_id,task_id',
      }
    );

    if (userTaskError) {
      addNotification('error', 'Ошибка', `Не удалось отметить задачу как начатую: ${userTaskError.message}`);
      throw new Error(`Не удалось отметить задачу как начатую: ${userTaskError.message}`);
    }

    addToStarted(Number(taskId));
    addNotification('success', 'Успешно', 'Решение отправлено на модерацию');
    await loadData();
  } catch (error: any) {
    addNotification('error', 'Ошибка', `Не удалось отправить решение: ${error.message || 'Неизвестная ошибка'}`);
    throw error;
  }
};