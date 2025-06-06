import { useState, useEffect, useRef } from 'react';
import { TypeTask } from '@/src/types/TypeTask';
import useNotification from '@hooks/useNotification';
import { NavigateFunction } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { updateTask } from '@lib/API/supabase/employerAPI';
import { supabase } from '@/supabaseClient';
import { formatDate } from '../data/formateDate';


type FormData = {
  title: string;
  description: string;
  difficulty: number;
  deadline: Date | null;
  tags: string[];
};

type UseTaskFormProps = {
  taskData: TypeTask;
  userId: number;
  companyName: string;
  commonTags: string[];
  userTags: string[];
  setUserTags: React.Dispatch<React.SetStateAction<string[]>>;
  queryClient: QueryClient;
  navigate: NavigateFunction;
};

export const useTaskForm = ({
  taskData,
  userId,
  companyName,
  commonTags,
  userTags,
  setUserTags,
  queryClient,
  navigate,
}: UseTaskFormProps) => {
  const { addNotification } = useNotification();

  const [formData, setFormData] = useState<FormData>({
    title: taskData.title,
    description: taskData.description,
    difficulty: taskData.difficulty,
    deadline: taskData.deadline ? new Date(taskData.deadline) : null,
    tags: taskData.tags || [],
  });
  const [newTag, setNewTag] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipAdded, setZipAdded] = useState<boolean>(!!taskData.zip_file_url);

  const MAX_TITLE_LENGTH = 50;
  const MAX_DESCRIPTION_LENGTH = 3000;
  const MAX_TAG_LENGTH = 20;
  const MAX_TAGS = 5;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [formData.description]);

  const handleFormChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTextChange = (field: 'title' | 'description', value: string) => {
    const maxLength = field === 'title' ? MAX_TITLE_LENGTH : MAX_DESCRIPTION_LENGTH;
    const minLength = field === 'title' ? 10 : 30;

    if (value.length < minLength) {
      addNotification(
        'warning',
        'Ошибка',
        `Поле "${field === 'title' ? 'Заголовок' : 'Описание'}" должно содержать минимум ${minLength} символов`
      );
      return;
    }
    if (value.length <= maxLength) {
      handleFormChange(field, value);
    } else {
      addNotification('warning', 'Ошибка', `Поле не может превышать ${maxLength} символов`);
    }
  };

  const handleDifficultyChange = (value: number) => {
    handleFormChange('difficulty', value);
  };

  const handleDeadlineChange = (date: Date | null) => {
    handleFormChange('deadline', date);
  };

  const handleTagChange = (tag: string) => {
    const newTags = formData.tags.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag];
    if (newTags.length <= MAX_TAGS) {
      handleFormChange('tags', newTags);
    } else {
      addNotification('warning', 'Ошибка', `Нельзя выбрать больше ${MAX_TAGS} тегов`);
    }
  };

  const handleNewTagChange = (value: string) => {
    if (value.length <= MAX_TAG_LENGTH) {
      setNewTag(value);
    } else {
      addNotification('warning', 'Ошибка', `Тег не может превышать ${MAX_TAG_LENGTH} символов`);
    }
  };

  const addCustomTag = async () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) {
      addNotification('warning', 'Ошибка', 'Тег не может быть пустым');
      return;
    }
    if (formData.tags.includes(trimmedTag) || commonTags.includes(trimmedTag) || userTags.includes(trimmedTag)) {
      addNotification('warning', 'Ошибка', 'Такой тег уже существует');
      return;
    }
    if (formData.tags.length >= MAX_TAGS) {
      addNotification('warning', 'Ошибка', `Нельзя добавить больше ${MAX_TAGS} тегов`);
      return;
    }

    try {
      await supabase.from('user_tags').insert({ user_id: userId, name: trimmedTag });
      handleFormChange('tags', [...formData.tags, trimmedTag]);
      setUserTags([...userTags, trimmedTag]);
      setNewTag('');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      addNotification('error', 'Ошибка', errorMessage);
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['.zip', '.rar', '.7z', '.tar', '.gz'];
      const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
      if (!validTypes.includes(fileExt)) {
        addNotification(
          'warning',
          'Ошибка',
          'Поддерживаются только архивы (.zip, .rar, .7z, .tar, .gz)'
        );
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        addNotification('warning', 'Ошибка', 'Размер архива не должен превышать 10MB');
        return;
      }
      setZipFile(file);
      setZipAdded(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      addNotification('error', 'Ошибка', 'Заголовок — обязательное поле');
      return;
    }
    if (!formData.description.trim()) {
      addNotification('error', 'Ошибка', 'Описание — обязательное поле');
      return;
    }
    if (!formData.difficulty) {
      addNotification('error', 'Ошибка', 'Сложность — обязательное поле');
      return;
    }
    if (!formData.deadline) {
      addNotification('error', 'Ошибка', 'Дата — обязательное поле');
      return;
    }
    if (!formData.tags.length) {
      addNotification('error', 'Ошибка', 'Теги — обязательное поле');
      return;
    }

    const deadlineStr = formatDate(formData.deadline);
    let zipFileUrl: string | null = taskData?.zip_file_url || null;

    if (zipFile) {
      try {
        if (taskData?.zip_file_url) {
          const oldFilePath = taskData.zip_file_url.split('/').pop();
          if (oldFilePath) {
            const { error: deleteError } = await supabase.storage
              .from('task-files')
              .remove([`tasks_files/${oldFilePath}`]);
            if (deleteError) {
              addNotification(
                'error',
                'Ошибка',
                `Не удалось удалить старый архив: ${deleteError.message}`
              );
              return;
            }
          }
        }

        const fileExt = zipFile.name.split('.').pop()?.toLowerCase() || 'zip';
        const baseName = formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .substring(0, 20);
        const fileName = `${Date.now()}_${userId}_${baseName}.${fileExt}`;
        const filePath = `tasks_files/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('task-files')
          .upload(filePath, zipFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          addNotification('error', 'Ошибка', `Не удалось загрузить архив: ${uploadError.message}`);
          return;
        }

        const { data: publicUrlData } = supabase.storage.from('task-files').getPublicUrl(filePath);
        zipFileUrl = publicUrlData.publicUrl;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
        addNotification('error', 'Ошибка', `Не удалось загрузить архив: ${errorMessage}`);
        return;
      }
    }

    const updatedTask: TypeTask = {
      id: taskData.id,
      tracking_number: taskData.tracking_number,
      title: formData.title,
      description: formData.description,
      difficulty: formData.difficulty,
      company_name: companyName,
      deadline: deadlineStr,
      tags: formData.tags,
      employer_id: userId,
      zip_file_url: zipFileUrl,
    };

    try {
      await updateTask(updatedTask, userId);
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      addNotification('success', 'Успешно', 'Задача обновлена');
      navigate('/user');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      addNotification('error', 'Ошибка', errorMessage);
    }
  };

  return {
    formData,
    newTag,
    zipFile,
    zipAdded,
    MAX_TITLE_LENGTH,
    MAX_DESCRIPTION_LENGTH,
    MAX_TAG_LENGTH,
    MAX_TAGS,
    textareaRef,
    setNewTag,
    setZipFile,
    setZipAdded,
    handleTextChange,
    handleDifficultyChange,
    handleDeadlineChange,
    handleTagChange,
    handleNewTagChange,
    addCustomTag,
    handleZipChange,
    handleSubmit,
  };
};