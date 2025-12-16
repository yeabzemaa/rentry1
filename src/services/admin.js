import api from './api';

// Admin login
export async function loginAdmin({ username, password }) {
  if (!username || !password) throw new Error('All fields required');
  const { data } = await api.post('/users/login', { username, password });
  // Expect { message, token, user }
  return data;
}

