import { supabase } from '@/supabaseClient';
import { TypeTask } from '@/src/types/TypeTask';
import { TypeTaskSubmission } from '@/src/types/TypeTaskSubmission';

export const getAllTasks = async (): Promise<TypeTask[]> => {
  const { data, error } = await supabase.from('tasks').select(`
      *,
      task_tags (
        tag_id,
        tag_type
      )
    `);

  if (error) {
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }

  // Обработка тегов
  const tasksWithTags = await Promise.all(
    data.map(async task => {
      const taskTags = task.task_tags || [];
      const tags: string[] = [];

      // Получаем общие теги
      const commonTagIds = taskTags
        .filter((tt: any) => tt.tag_type === 'common')
        .map((tt: any) => tt.tag_id);
      if (commonTagIds.length > 0) {
        const { data: commonTags, error: commonTagsError } = await supabase
          .from('tags')
          .select('name')
          .in('id', commonTagIds);
        if (commonTagsError) {
          throw new Error(`Failed to fetch common tags: ${commonTagsError.message}`);
        }
        tags.push(...commonTags.map((tag: any) => tag.name));
      }

      // Получаем кастомные теги
      const userTagIds = taskTags
        .filter((tt: any) => tt.tag_type === 'user')
        .map((tt: any) => tt.tag_id);
      if (userTagIds.length > 0) {
        const { data: userTags, error: userTagsError } = await supabase
          .from('user_tags')
          .select('name')
          .in('id', userTagIds);
        if (userTagsError) {
          throw new Error(`Failed to fetch user tags: ${userTagsError.message}`);
        }
        tags.push(...userTags.map((tag: any) => tag.name));
      }

      return {
        ...task,
        tags,
      };
    })
  );

  return tasksWithTags;
};

export const getTaskById = async (taskId: number): Promise<TypeTask | null> => {
  try {
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskError) {
      throw new Error(`Не удалось загрузить задачу: ${taskError.message}`);
    }

    if (!taskData) return null;

    const { data: taskTags, error: taskTagsError } = await supabase
      .from('task_tags')
      .select('tag_id, tag_type')
      .eq('task_id', taskId);

    if (taskTagsError) {
      throw new Error(`Не удалось загрузить связи тегов: ${taskTagsError.message}`);
    }

    const tags: string[] = [];

    const commonTagIds = taskTags.filter(tt => tt.tag_type === 'common').map(tt => tt.tag_id);

    if (commonTagIds.length > 0) {
      const { data: commonTags, error: commonTagsError } = await supabase
        .from('tags')
        .select('name')
        .in('id', commonTagIds);

      if (commonTagsError) {
        throw new Error(`Не удалось загрузить общие теги: ${commonTagsError.message}`);
      }

      tags.push(...commonTags.map(tag => tag.name));
    }

    const userTagIds = taskTags.filter(tt => tt.tag_type === 'user').map(tt => tt.tag_id);

    if (userTagIds.length > 0) {
      const { data: userTags, error: userTagsError } = await supabase
        .from('user_tags')
        .select('name')
        .in('id', userTagIds);

      if (userTagsError) {
        throw new Error(`Не удалось загрузить кастомные теги: ${userTagsError.message}`);
      }

      tags.push(...userTags.map(tag => tag.name));
    }

    return {
      ...taskData,
      tags,
    };
  } catch (error: any) {
    throw new Error(`Не удалось загрузить задачу: ${error.message}`);
  }
};

export const addTaskToFavorites = async (userId: number, taskId: number): Promise<void> => {
  const { error } = await supabase
    .from('user_tasks')
    .upsert({ user_id: userId, task_id: taskId, is_favorite: true });

  if (error) {
    throw new Error(`Failed to add task to favorites: ${error.message}`);
  }
};

export const getUserFavorites = async (userId: number): Promise<number[]> => {
  const { data, error } = await supabase
    .from('user_tasks')
    .select('task_id')
    .eq('user_id', userId)
    .eq('is_favorite', true);

  if (error) {
    throw new Error(`Failed to fetch user favorites: ${error.message}`);
  }

  return data.map(item => item.task_id);
};

export const removeTaskFromFavorite = async (userId: number, taskId: number) => {
  const { error } = await supabase
    .from('user_tasks')
    .update({ is_favorite: false })
    .eq('user_id', userId)
    .eq('task_id', taskId);
  if (error) throw error;
};

export const addTaskToStarted = async (userId: number, taskId: number): Promise<void> => {
  const { error } = await supabase
    .from('user_tasks')
    .upsert({ user_id: userId, task_id: taskId, is_started: true });
  if (error) throw new Error(`Failed to add task to started: ${error.message}`);
};

export const removeTaskFromStarted = async (userId: number, taskId: number): Promise<void> => {
  const { error } = await supabase
    .from('user_tasks')
    .delete()
    .eq('user_id', userId)
    .eq('task_id', taskId)
    .eq('is_started', true);
  if (error) throw new Error(`Failed to remove task from started: ${error.message}`);
};

export const addTaskToFinished = async (userId: number, taskId: number): Promise<void> => {
  const { error } = await supabase
    .from('user_tasks')
    .upsert({ user_id: userId, task_id: taskId, is_finished: true });
  if (error) throw new Error(`Failed to add task to finished: ${error.message}`);
};

export const removeTaskFromFinished = async (userId: number, taskId: number): Promise<void> => {
  const { error } = await supabase
    .from('user_tasks')
    .delete()
    .eq('user_id', userId)
    .eq('task_id', taskId)
    .eq('is_finished', true);
  if (error) throw new Error(`Failed to remove task from finished: ${error.message}`);
};

export const getUniqueCompanies = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('company_name')
      .order('company_name', { ascending: true });

    if (error) throw error;

    const uniqueCompanies = [...new Set(data.map(item => item.company_name))];
    return uniqueCompanies;
  } catch (error: any) {
    throw new Error(`Не удалось загрузить компании: ${error.message}`);
  }
};
