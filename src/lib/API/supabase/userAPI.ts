import { supabase } from '@/supabaseClient';
import { TypeUser } from '@/src/types/TypeUser';

export type TypeUserData = {
	email: string
	role: 'user' | 'employer' | 'admin'
	first_name?: string
	last_name?: string
	student_group?: string
	course?: number | string
	company_name?: string | null
}

export const createUser = async (userData: TypeUserData) => {
  const { email, role, first_name, last_name, student_group, course, company_name } = userData;

  const dataToInsert: TypeUserData = {
    email,
    role,
    first_name,
    last_name,
    student_group,
    course,
    company_name: role === 'employer' ? company_name : null,
  };

  // Удаляем undefined значения
  (Object.keys(dataToInsert) as (keyof TypeUserData)[]).forEach(key => {
    if (dataToInsert[key] === undefined) {
      delete dataToInsert[key];
    }
  });

  const { data, error } = await supabase.from('users').insert(dataToInsert).select();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  // Сохраняем только существующие данные
  if (first_name) localStorage.setItem('first_name', first_name);
  if (last_name) localStorage.setItem('last_name', last_name);
  if (data && data[0]?.id) localStorage.setItem('userId', data[0].id.toString());
  localStorage.setItem('role', role);
};

export const getUserByEmail = async (email: string): Promise<TypeUser | null> => {
  const { data, error } = await supabase.from('users').select('*').eq('email', email).single();

  if (error) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data;
};

export const getUserUuidById = async (userId: number): Promise<string | null> => {
  const { data, error } = await supabase.from('users').select('uuid').eq('id', userId).single();

  if (error) {
    throw new Error(`Failed to fetch user UUID: ${error.message}`);
  }

  return data?.uuid || null;
};

export const getRole = (): 'user' | 'employer' | null => {
  const role = localStorage.getItem('role');
  if (role === 'user' || role === 'employer') {
    return role;
  }
  return null;
};

export const getUserId = (): number | null => {
  const userId = localStorage.getItem('userId');
  return userId ? parseInt(userId, 10) : null;
};

export const clearAuthData = () => {
  localStorage.removeItem('userId');
  localStorage.removeItem('role');
  localStorage.removeItem('rememberMe');
  localStorage.removeItem('email');
};

export const signInWithPassword = async (email: string, password: string) => {
  const {
    data: { user, session },
    error,
  } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw new Error(`Ошибка входа: ${error.message}`);
  if (!user || !session) throw new Error('Не удалось войти: пользователь или сессия отсутствуют');

  return { user, session };
};

// Регистрация пользователя через Supabase
export const signUp = async (email: string, password: string) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({ email, password });

  if (error) throw new Error(`Ошибка регистрации: ${error.message}`);
  if (!user) throw new Error('Не удалось зарегистрировать пользователя');

  return user;
};

// Установка сессии в Supabase
export const setSession = async (accessToken: string, refreshToken: string) => {
  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) throw new Error(`Ошибка восстановления сессии: ${error.message}`);
};

// Получение текущего пользователя из Supabase
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw new Error(`Ошибка получения пользователя: ${error.message}`);
  return user;
};

// Получение текущей сессии из Supabase
export const getCurrentSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw new Error(`Ошибка получения сессии: ${error.message}`);
  return session;
};
