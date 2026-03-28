import { createContext, useContext, useEffect, useState } from 'react';
import API, { setAuthToken } from '../api/api';
import socket from '../socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      if (user?._id) {
        socket.emit('joinUser', user._id);
      }
    } else {
      setAuthToken(null);
    }
  }, [token, user]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const res = await API.post('/auth/login', { email, password });
      setUser(res.data);
      setToken(res.data.token);
      socket.emit('joinUser', res.data._id);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);

    try {
      const res = await API.post('/auth/register', { name, email, password });
      setUser(res.data);
      setToken(res.data.token);
      socket.emit('joinUser', res.data._id);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    socket.emit('leaveProject');
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, error, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
