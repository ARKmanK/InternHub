import { supabase } from '@/supabaseClient';
import getRandomNumber from '@/src/data/getRandomNumber';
import { getUserId } from './userAPI';


export const uploadFileAndCreateRecord = async (
  taskActivityId: number,
  file: File,
  fileType: 'archive' | 'image'
): Promise<string> => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }

    const randomNum = fileType === 'archive' ? getRandomNumber(1, 100) : getRandomNumber(1, 10000);

    const fileName =
      fileType === 'archive'
        ? `user_${userId}_file${randomNum}`
        : `img_${userId}_${randomNum}`;

    const fileExt = file.name.split('.').pop() || 'dat';
    const fullFileName = `${fileName}.${fileExt}`;
    const filePath = `${fileType}s/${fullFileName}`;

    const { error: uploadError } = await supabase.storage
    .from('task-files')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
  });

if (uploadError) {
  throw new Error(`Не удалось загрузить файл: ${uploadError.message}`);
}

    const { data: urlData } = supabase.storage.from('task-files').getPublicUrl(filePath);
    const fileUrl = urlData.publicUrl;

    if (!fileUrl) {
      throw new Error('Не удалось получить публичный URL файла');
    }

    const { error: dbError } = await supabase.from('task_files').insert({
      task_activity_id: taskActivityId,
      file_name: fullFileName,
      file_url: fileUrl,
      file_type: fileType,
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      throw new Error(`Не удалось создать запись о файле: ${dbError.message}`);
    }

    return fileUrl;
  } catch (error: any) {
    console.error('Ошибка в uploadFileAndCreateRecord:', error);
    throw new Error(`Не удалось загрузить файл: ${error.message}`);
  }
};
