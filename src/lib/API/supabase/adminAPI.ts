import { supabase } from '@/supabaseClient';
import { TypeTaskSubmission } from '@/src/types/TypeTaskSubmission';
import { PostgrestError } from '@supabase/supabase-js';

export const getPendingTaskSubmissions = async (): Promise<TypeTaskSubmission[]> => {
  const { data: submissions, error: submissionError } = await supabase
    .from('task_submissions')
    .select('*');

  if (submissionError) {
    throw new Error(`Failed to fetch pending task submissions: ${submissionError.message}`);
  }

  if (!submissions || submissions.length === 0) {
    return [];
  }

  return submissions.map(submission => ({
    id: submission.id,
    user_id: submission.user_id,
    submission_url: submission.submission_url,
    zip_file_url: submission.zip_file_url,
    comment: submission.comment,
    photos: submission.photos,
    submitted_at: submission.submitted_at,
    title: submission.title,
    description: submission.description,
    difficulty: submission.difficulty,
    company_name: submission.company_name,
    deadline: submission.deadline,
    employer_id: submission.employer_id,
    tags: submission.tags,
  }));
};

export const approveTaskSubmission = async (submissionId: number): Promise<void> => {
  const result = await supabase.from('task_submissions').select('*').eq('id', submissionId).single();

  const { data: submission, error: fetchError } = result as {
    data: TypeTaskSubmission | null;
    error: PostgrestError | null;
  };

  if (fetchError) {
    throw new Error(`Failed to fetch submission: ${fetchError.message}`);
  }

  if (!submission) {
    throw new Error('Submission not found');
  }

  const newTask = {
    tracking_number: 0,
    title: submission.title,
    description: submission.description,
    difficulty: submission.difficulty,
    company_name: submission.company_name,
    deadline: submission.deadline,
    employer_id: submission.employer_id,
    created_at: new Date().toISOString(),
    zip_file_url: submission.zip_file_url,
  };

  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .insert(newTask)
    .select()
    .single();

  if (taskError) {
    throw new Error(`Failed to create task: ${taskError.message}`);
  }

  const taskId = taskData.id;

  // Переносим теги, если они есть
  if (submission.tags && submission.tags.length > 0 && submission.employer_id) {
    // 1. Получаем существующие общие теги
    const { data: existingCommonTags, error: fetchCommonTagsError } = await supabase
      .from('tags')
      .select('id, name')
      .in('name', submission.tags);

    if (fetchCommonTagsError) {
      throw new Error(`Не удалось получить общие теги: ${fetchCommonTagsError.message}`);
    }

    const commonTagNames = existingCommonTags.map(tag => tag.name);
    const commonTagsMap = new Map(existingCommonTags.map(tag => [tag.name, tag.id]));

    // 2. Получаем существующие кастомные теги пользователя
    const { data: existingUserTags, error: fetchUserTagsError } = await supabase
      .from('user_tags')
      .select('id, name')
      .eq('user_id', submission.employer_id)
      .in('name', submission.tags);

    if (fetchUserTagsError) {
      throw new Error(`Не удалось получить кастомные теги: ${fetchUserTagsError.message}`);
    }

    const userTagNames = existingUserTags.map(tag => tag.name);
    const userTagsMap = new Map(existingUserTags.map(tag => [tag.name, tag.id]));

    // 3. Создаем новые кастомные теги, если их нет
    const newTags = submission.tags.filter(
      tag => !commonTagNames.includes(tag) && !userTagNames.includes(tag)
    );
    for (const tag of newTags) {
      const { data: newUserTag, error: createTagError } = await supabase
        .from('user_tags')
        .insert({ user_id: submission.employer_id, name: tag })
        .select('id')
        .single();

      if (createTagError) {
        throw new Error(`Не удалось создать кастомный тег: ${createTagError.message}`);
      }
      userTagsMap.set(tag, newUserTag.id);
    }

    // 4. Связываем теги с задачей через task_tags
    const taskTags = submission.tags.map(tag => {
      if (commonTagNames.includes(tag)) {
        return {
          task_id: taskId,
          tag_id: commonTagsMap.get(tag),
          tag_type: 'common',
        };
      } else {
        return {
          task_id: taskId,
          tag_id: userTagsMap.get(tag),
          tag_type: 'user',
        };
      }
    });

    const { error: taskTagsError } = await supabase.from('task_tags').insert(taskTags);
    if (taskTagsError) {
      throw new Error(`Не удалось связать теги с задачей: ${taskTagsError.message}`);
    }
  }

  // Обновляем status в task_activity для связанных записей
  const { error: activityUpdateError } = await supabase
    .from('task_activity')
    .update({ status: 'approved' })
    .eq('task_id', taskId)
    .eq('status', 'verifying');

  if (activityUpdateError) {
    throw new Error(`Failed to update task_activity status: ${activityUpdateError.message}`);
  }

  const { error: deleteError } = await supabase
    .from('task_submissions')
    .delete()
    .eq('id', submissionId);

  if (deleteError) {
    throw new Error(`Failed to delete submission: ${deleteError.message}`);
  }
};

export const rejectTaskSubmission = async (submissionId: number): Promise<void> => {
  const { data: submission, error: fetchError } = await supabase
    .from('task_submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch submission: ${fetchError.message}`);
  }

  if (!submission) {
    throw new Error('Submission not found');
  }

  const { error: activityUpdateError } = await supabase
    .from('task_activity')
    .update({ status: 'rejected' })
    .eq('task_id', submission.task_id)
    .eq('status', 'verifying');

  if (activityUpdateError) {
    throw new Error(`Failed to update task activity status: ${activityUpdateError.message}`);
  }

  const { error } = await supabase.from('task_submissions').delete().eq('id', submissionId);

  if (error) {
    throw new Error(`Failed to delete submission: ${error.message}`);
  }
};

export const getTaskSubmissionsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('task_submissions')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error; // Используем error напрямую как PostgrestError
    }

    return count || 0;
  } catch (error) {
    const pgError = error as PostgrestError;
    throw new Error(`Error fetching task submissions count: ${pgError.message}`);
  }
};