import { useState, useEffect } from 'react';
import { NavigateFunction } from 'react-router-dom';
import useNotification from '@hooks/useNotification';
import { supabase } from '@/supabaseClient';
import { getRole, getUserId } from '@lib/API/supabase/userAPI';
import { deleteUserTag, getAllTags, getUserTags } from '@lib/API/supabase/tagsAPI';
import getRandomNumber from '@data/getRandomNumber';
import { formatDate } from '@data/formateDate';


export const useAddTaskForm = (navigate: NavigateFunction) => {
  const { notifications, addNotification } = useNotification();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [difficulty, setDifficulty] = useState<number>(0);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [commonTags, setCommonTags] = useState<string[]>([]);
  const [userTags, setUserTags] = useState<string[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipAdded, setZipAdded] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const MAX_TITLE_LENGTH = 50;
  const MIN_TITLE_LENGTH = 10;
  const MAX_DESCRIPTION_LENGTH = 3000;
  const MIN_DESCRIPTION_LENGTH = 30;
  const MAX_TAG_LENGTH = 20;
  const MAX_TAGS = 5;

  useEffect(() => {
    const initialRole = getRole();
    const initialUserId = getUserId();
    setRole(initialRole);
    setUserId(initialUserId);
  }, []);

  useEffect(() => {
    if (hasFetched || role === null || userId === null) return;

    const fetchData = async () => {
      if (role !== 'employer') {
        addNotification('warning', 'Ошибка', 'Только работодатели могут создавать задачи');
        navigate('/tasks');
        setHasFetched(true);
        return;
      }

      try {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('company_name')
          .eq('id', userId)
          .single();
        if (userError) throw new Error(`Не удалось получить данные компании: ${userError.message}`);
        setCompanyName(user.company_name || 'Неизвестная компания');
        const commonTagsData = await getAllTags();
        setCommonTags(commonTagsData.map(tag => tag.name));
        const userTagsData = await getUserTags(userId);
        setUserTags(userTagsData);
        setHasFetched(true);
      } catch (error: any) {
        addNotification('error', 'Ошибка', error.message);
        navigate('/tasks');
        setHasFetched(true);
      }
    };
    fetchData();
  }, [role, userId, navigate, addNotification]);

  const handleTagChange = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else if (tags.length < MAX_TAGS) {
      setTags([...tags, tag]);
    } else {
      addNotification('warning', 'Ошибка', `Нельзя выбрать больше ${MAX_TAGS} тегов`);
    }
  };

  const handleNewTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_TAG_LENGTH) setNewTag(value);
    else addNotification('warning', 'Ошибка', `Тег не может превышать ${MAX_TAG_LENGTH} символов`);
  };

  const addCustomTag = async () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) {
      addNotification('warning', 'Ошибка', 'Тег не может быть пустым');
      return;
    }
    if (tags.includes(trimmedTag) || commonTags.includes(trimmedTag) || userTags.includes(trimmedTag)) {
      addNotification('warning', 'Ошибка', 'Такой тег уже существует');
      return;
    }
    if (tags.length >= MAX_TAGS) {
      addNotification('warning', 'Ошибка', `Нельзя добавить больше ${MAX_TAGS} тегов`);
      return;
    }

    try {
      if (userId) await supabase.from('user_tags').insert({ user_id: userId, name: trimmedTag });
      setTags([...tags, trimmedTag]);
      setUserTags([...userTags, trimmedTag]);
      setNewTag('');
    } catch (error: any) {
      addNotification('error', 'Ошибка', error.message);
    }
  };

  const removeCustomTag = async (tagToRemove: string) => {
    try {
      if (userId) await deleteUserTag(userId, tagToRemove);
      setTags(tags.filter(tag => tag !== tagToRemove));
      setUserTags(userTags.filter(tag => tag !== tagToRemove));
    } catch (error: any) {
      addNotification('error', 'Ошибка', error.message);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_TITLE_LENGTH) setTitle(value);
    else
      addNotification('warning', 'Ошибка', `Название не может превышать ${MAX_TITLE_LENGTH} символов`);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_DESCRIPTION_LENGTH) setDescription(value);
    else
      addNotification(
        'warning',
        'Ошибка',
        `Описание не может превышать ${MAX_DESCRIPTION_LENGTH} символов`
      );
  };

  const handleDifficultyChange = (value: number) => {
    setDifficulty(value);
  };

  const handleDeadlineChange = (date: Date | null) => {
    setDeadline(date);
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
      if (file.size > 100 * 1024 * 1024) {
        addNotification('warning', 'Ошибка', 'Размер архива не должен превышать 30MB');
        return;
      }
      setZipFile(file);
      setZipAdded(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim().length < MIN_TITLE_LENGTH) {
      addNotification(
        'warning',
        'Ошибка',
        `Название должно содержать минимум ${MIN_TITLE_LENGTH} символов`
      );
      return;
    }
    if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
      addNotification(
        'warning',
        'Ошибка',
        `Описание должно содержать минимум ${MIN_DESCRIPTION_LENGTH} символов`
      );
      return;
    }
    if (!title.trim()) {
      addNotification('warning', 'Ошибка', 'Название — обязательное поле');
      return;
    }
    if (!description.trim()) {
      addNotification('warning', 'Ошибка', 'Описание — обязательное поле');
      return;
    }
    if (!difficulty) {
      addNotification('warning', 'Ошибка', 'Сложность — обязательное поле');
      return;
    }
    if (!deadline) {
      addNotification('warning', 'Ошибка', 'Дата — обязательное поле');
      return;
    }
    if (!tags.length) {
      addNotification('warning', 'Ошибка', 'Теги — обязательное поле');
      return;
    }
    if (!userId) {
      addNotification('warning', 'Ошибка', 'Пользователь не авторизован');
      navigate('/login');
      return;
    }

    const deadlineStr = formatDate(deadline);
    let zipFileUrl: string | null = null;

    if (zipFile) {
      try {
        const fileExt = zipFile.name.split('.').pop()?.toLowerCase() || 'zip';
        const randomNumber = getRandomNumber(1, 10000);
        const fileName = `task${randomNumber}.${fileExt}`;
        const filePath = `tasks_files/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('task-files')
          .upload(filePath, zipFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw new Error(`Не удалось загрузить архив: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage.from('task-files').getPublicUrl(filePath);
        zipFileUrl = publicUrlData.publicUrl;
      } catch (error: any) {
        addNotification('error', 'Ошибка', `Не удалось загрузить архив: ${error.message}`);
        return;
      }
    }

    const submissionData = {
      user_id: userId,
      submission_url: null,
      zip_file_url: zipFileUrl,
      comment: null,
      photos: null,
      title,
      description,
      difficulty,
      company_name: companyName,
      deadline: deadlineStr,
      employer_id: userId,
      tags: tags.length > 0 ? tags : null,
    };

    try {
      const { error } = await supabase.from('task_submissions').insert(submissionData);
      if (error) throw new Error(`Не удалось создать задачу: ${error.message}`);

      setTitle('');
      setDescription('');
      setDifficulty(0);
      setDeadline(null);
      setTags([]);
      setNewTag('');
      setZipFile(null);
      setZipAdded(false);
      navigate('/tasks', { state: { showSuccessNotification: true } });
    } catch (error: any) {
      addNotification('error', 'Ошибка', `Не удалось создать задачу: ${error.message}`);
    }
  };

  return {
    title,
    description,
    difficulty,
    deadline,
    tags,
    newTag,
    companyName,
    commonTags,
    userTags,
    zipFile,
    zipAdded,
    role,
    userId,
    MAX_TITLE_LENGTH,
    MIN_TITLE_LENGTH,
    MAX_DESCRIPTION_LENGTH,
    MIN_DESCRIPTION_LENGTH,
    MAX_TAG_LENGTH,
    MAX_TAGS,
    notifications,
    addNotification,
    handleTagChange,
    handleNewTagChange,
    addCustomTag,
    removeCustomTag,
    handleTitleChange,
    handleDescriptionChange,
    handleDifficultyChange,
    handleDeadlineChange,
    handleZipChange,
    handleSubmit,
  };
};