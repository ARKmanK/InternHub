import { supabase } from '@/supabaseClient';
import { TypeTask } from '@/src/types/TypeTask';
import { createUserTag } from './tagsAPI';

export type TypeTaskReport = {
  taskTitle: string;
  newActivitiesCount: number;
};

export const createTask = async (
  taskData: Omit<TypeTask, 'id' | 'tags'>,
  tags: string[],
  userId: number
): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        tracking_number: taskData.tracking_number,
        title: taskData.title,
        description: taskData.description,
        difficulty: taskData.difficulty,
        company_name: taskData.company_name,
        deadline: taskData.deadline,
        employer_id: taskData.employer_id,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Не удалось создать задачу: ${error.message}`);
    }

    if (!data) {
      throw new Error('Задача не была создана');
    }

    const taskId = data.id;

    const { data: existingCommonTags, error: fetchCommonTagsError } = await supabase
      .from('tags')
      .select('id, name')
      .in('name', tags);

    if (fetchCommonTagsError) {
      throw new Error(`Не удалось получить общие теги: ${fetchCommonTagsError.message}`);
    }

    const commonTagNames = existingCommonTags.map(tag => tag.name);
    const commonTagsMap = new Map(existingCommonTags.map(tag => [tag.name, tag.id]));

    const { data: existingUserTags, error: fetchUserTagsError } = await supabase
      .from('user_tags')
      .select('id, name')
      .eq('user_id', userId)
      .in('name', tags);

    if (fetchUserTagsError) {
      throw new Error(`Не удалось получить кастомные теги: ${fetchUserTagsError.message}`);
    }

    const userTagNames = existingUserTags.map(tag => tag.name);
    const userTagsMap = new Map(existingUserTags.map(tag => [tag.name, tag.id]));

    const newTags = tags.filter(tag => !commonTagNames.includes(tag) && !userTagNames.includes(tag));
    for (const tag of newTags) {
      const userTagId = await createUserTag(userId, tag);
      userTagsMap.set(tag, userTagId);
    }

    const taskTags = tags.map(tag => {
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

    return taskId;
  } catch (error: any) {
    throw new Error(`Ошибка при создании задачи: ${error.message}`);
  }
};

export const updateTask = async (task: TypeTask, userId: number): Promise<void> => {
  try {
    const { error: taskError } = await supabase
      .from('tasks')
      .update({
        title: task.title,
        description: task.description,
        difficulty: task.difficulty,
        company_name: task.company_name,
        deadline: task.deadline,
        zip_file_url: task.zip_file_url,
      })
      .eq('id', task.id)
      .eq('employer_id', userId);

    if (taskError) throw taskError;

    const { error: deleteTagsError } = await supabase
      .from('task_tags')
      .delete()
      .eq('task_id', task.id);

    if (deleteTagsError) throw deleteTagsError;

    const { data: existingCommonTags, error: fetchCommonTagsError } = await supabase
      .from('tags')
      .select('id, name')
      .in('name', task.tags || []);

    if (fetchCommonTagsError) throw fetchCommonTagsError;

    const commonTagNames = existingCommonTags.map(tag => tag.name);
    const commonTagsMap = new Map(existingCommonTags.map(tag => [tag.name, tag.id]));

    const { data: existingUserTags, error: fetchUserTagsError } = await supabase
      .from('user_tags')
      .select('id, name')
      .eq('user_id', userId)
      .in('name', task.tags || []);

    if (fetchUserTagsError) throw fetchUserTagsError;

    const userTagNames = existingUserTags.map(tag => tag.name);
    const userTagsMap = new Map(existingUserTags.map(tag => [tag.name, tag.id]));

    const newTags = (task.tags || []).filter(
      tag => !commonTagNames.includes(tag) && !userTagNames.includes(tag)
    );
    for (const tag of newTags) {
      const userTagId = await createUserTag(userId, tag);
      userTagsMap.set(tag, userTagId);
    }

    const taskTags = (task.tags || []).map(tag => {
      if (commonTagNames.includes(tag)) {
        return {
          task_id: task.id,
          tag_id: commonTagsMap.get(tag),
          tag_type: 'common',
        };
      } else {
        return {
          task_id: task.id,
          tag_id: userTagsMap.get(tag),
          tag_type: 'user',
        };
      }
    });

    const { error: taskTagsError } = await supabase.from('task_tags').insert(taskTags);
    if (taskTagsError) throw taskTagsError;
  } catch (error: any) {
    throw new Error(`Не удалось обновить задачу: ${error.message}`);
  }
};

export const deleteTask = async (taskId: number, userId: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('employer_id', userId);

    if (error) {
      throw new Error(`Не удалось удалить задачу: ${error.message}`);
    }
  } catch (error: any) {
    throw new Error(`Ошибка при удалении задачи: ${error.message}`);
  }
};

export const getEmployerTaskReport = async (employerId: number): Promise<TypeTaskReport[]> => {
  try {
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title')
      .eq('employer_id', employerId);

    if (tasksError) {
      throw new Error(`Не удалось загрузить задачи: ${tasksError.message}`);
    }

    if (!tasks || tasks.length === 0) {
      return [];
    }

    const report: TypeTaskReport[] = await Promise.all(
      tasks.map(async (task) => {
        const { count, error: activityError } = await supabase
          .from('task_activity')
          .select('*', { count: 'exact', head: true })
          .eq('task_id', task.id)
          .eq('status', 'verifying');

        if (activityError) {
          throw new Error(`Не удалось загрузить активности для задачи ${task.id}: ${activityError.message}`);
        }

        return {
          taskTitle: task.title.length > 30 ? task.title.substring(0, 30) + '...' : task.title,
          newActivitiesCount: count || 0,
        };
      })
    );

    return report.filter(item => item.newActivitiesCount > 0);
  } catch (error: any) {
    throw new Error(`Ошибка при создании отчета: ${error.message}`);
  }
};
