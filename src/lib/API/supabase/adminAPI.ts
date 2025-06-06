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
    throw new Error(`Не удалось получить задачу: ${fetchError.message}`);
  }

  if (!submission) {
    throw new Error('Задача не найдена');
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
    throw new Error(`Не удалось создать задачу: ${taskError.message}`);
  }

  const taskId = taskData.id;

  if (submission.tags && submission.tags.length > 0) {
    const { data: existingCommonTags, error: fetchCommonTagsError } = await supabase
      .from('tags')
      .select('id, name')
      .in('name', submission.tags);

    if (fetchCommonTagsError) {
      throw new Error(`Не удалось получить общие теги: ${fetchCommonTagsError.message}`);
    }

    const commonTagNames = existingCommonTags.map(tag => tag.name);
    const commonTagsMap = new Map(existingCommonTags.map(tag => [tag.name, tag.id]));

    const { data: existingUserTags, error: fetchUserTagsError } = await supabase
      .from('user_tags')
      .select('id, name')
      .eq('user_id', submission.employer_id)
      .in('name', submission.tags);

    if (fetchUserTagsError) {
      throw new Error(`Не удалось получить пользовательские теги: ${fetchUserTagsError.message}`);
    }

    const userTagNames = existingUserTags.map(tag => tag.name);
    const userTagsMap = new Map(existingUserTags.map(tag => [tag.name, tag.id]));

    const taskTags = submission.tags
      .map((tag: string) => {
        if (commonTagNames.includes(tag)) {
          return {
            task_id: taskId,
            tag_id: commonTagsMap.get(tag)!,
            tag_type: 'common',
          };
        } else if (userTagNames.includes(tag)) {
          return {
            task_id: taskId,
            tag_id: userTagsMap.get(tag)!,
            tag_type: 'user',
          };
        } else {
          return null;
        }
      })
      .filter(
        (
          tag: { task_id: number; tag_id: number; tag_type: string } | null
        ): tag is { task_id: number; tag_id: number; tag_type: string } => tag !== null
      );

    if (taskTags.length > 0) {
      const { error: taskTagError } = await supabase.from('task_tags').insert(taskTags);
      if (taskTagError) {
        throw new Error(`Не удалось связать теги с задачей: ${taskTagError.message}`);
      }
    }
  }

  const { error: deleteError } = await supabase
    .from('task_submissions')
    .delete()
    .eq('id', submissionId);

  if (deleteError) {
    throw new Error(`Не удалось удалить задачу: ${deleteError.message}`);
  }
};

export const rejectTaskSubmission = async (submissionId: number): Promise<void> => {
  const { error } = await supabase.from('task_submissions').delete().eq('id', submissionId);

  if (error) {
    throw new Error(`Не удалось отклонить задачу: ${error.message}`);
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