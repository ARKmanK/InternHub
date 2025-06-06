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
