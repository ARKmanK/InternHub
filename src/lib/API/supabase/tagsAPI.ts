import { supabase } from '@/supabaseClient';
import { TypeTag } from '@/src/types/TypeTag';

export const getAllTags = async (): Promise<TypeTag[]> => {
  const { data, error } = await supabase.from('tags').select('id, name');
  if (error) {
    throw new Error(`Не удалось загрузить общие теги: ${error.message}`);
  }
  return data || [];
};

export const getUserTags = async (userId: number): Promise<string[]> => {
  const { data, error } = await supabase.from('user_tags').select('name').eq('user_id', userId);

  if (error) {
    throw new Error(`Не удалось загрузить пользовательские теги: ${error.message}`);
  }

  return data.map(item => item.name).filter((name): name is string => name !== null) || [];
};

export const createUserTag = async (userId: number, tagName: string): Promise<number> => {
  const { data, error } = await supabase
    .from('user_tags')
    .insert({ user_id: userId, name: tagName })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create user tag: ${error.message}`);
  }

  return data.id;
};

export const deleteUserTag = async (userId: number, tagName: string): Promise<void> => {
  const { error } = await supabase
    .from('user_tags')
    .delete()
    .eq('user_id', userId)
    .eq('name', tagName);

  if (error) {
    throw new Error(`Не удалось удалить пользовательский тег: ${error.message}`);
  }
};
