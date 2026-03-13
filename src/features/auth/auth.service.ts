export const login = async (credentials: any) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
};

export const signup = async (userData: any) => {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) throw new Error('Signup failed');
  return res.json();
};

export const getOAuthUrl = async (provider: string, role: string) => {
  const res = await fetch(`/api/auth/${provider}/url?role=${role}`);
  if (!res.ok) throw new Error('Failed to get OAuth URL');
  return res.json();
};

export const forgotPassword = async (email: string) => {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw new Error('Failed to send password reset email');
  return res.json();
};
