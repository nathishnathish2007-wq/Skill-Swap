import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const AuthContext = createContext(null);

const initialState = {
  user: JSON.parse(localStorage.getItem('skillswap_user') || 'null'),
  token: localStorage.getItem('skillswap_token'),
  loading: true
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, user: action.user, token: action.token, loading: false };
    case 'SET_USER':
      return { ...state, user: action.user, loading: false };
    case 'LOGOUT':
      return { user: null, token: null, loading: false };
    case 'READY':
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    async function restoreSession() {
      if (!state.token) {
        dispatch({ type: 'READY' });
        return;
      }

      try {
        const { data } = await api.get('/users/me');
        localStorage.setItem('skillswap_user', JSON.stringify(data.user));
        dispatch({ type: 'SET_USER', user: data.user });
      } catch {
        localStorage.removeItem('skillswap_token');
        localStorage.removeItem('skillswap_user');
        dispatch({ type: 'LOGOUT' });
      }
    }

    restoreSession();
  }, []);

  async function login(credentials) {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('skillswap_token', data.token);
    localStorage.setItem('skillswap_user', JSON.stringify(data.user));
    dispatch({ type: 'SET_SESSION', user: data.user, token: data.token });
    toast.success(`Welcome back, ${data.user.name.split(' ')[0]}.`);
    return data.user;
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('skillswap_token', data.token);
    localStorage.setItem('skillswap_user', JSON.stringify(data.user));
    dispatch({ type: 'SET_SESSION', user: data.user, token: data.token });
    toast.success('Your SkillSwap profile is ready.');
    return data.user;
  }

  async function refreshUser() {
    const { data } = await api.get('/users/me');
    localStorage.setItem('skillswap_user', JSON.stringify(data.user));
    dispatch({ type: 'SET_USER', user: data.user });
    return data.user;
  }

  async function updateProfile(updates) {
    const { data } = await api.put(`/users/${state.user._id}`, updates);
    localStorage.setItem('skillswap_user', JSON.stringify(data.user));
    dispatch({ type: 'SET_USER', user: data.user });
    toast.success('Profile updated.');
    return data.user;
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // The local session should still be cleared if the network call fails.
    }
    localStorage.removeItem('skillswap_token');
    localStorage.removeItem('skillswap_user');
    dispatch({ type: 'LOGOUT' });
  }

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.token && state.user),
      login,
      register,
      logout,
      refreshUser,
      updateProfile
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
