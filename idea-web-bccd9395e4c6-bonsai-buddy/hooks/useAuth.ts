import { useState } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState({ name: 'John Doe', email: 'john@example.com' });

  const logout = () => {
    setUser({ name: '', email: '' });
  };

  return { user, logout };
};
