import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';
import { AuthState, RegisterData, User } from '../types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user: User, accessToken: string, refreshToken: string) => {
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { user, accessToken, refreshToken } = res.data.data;
          set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false });
          throw new Error(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/register', data);
          const { user, accessToken, refreshToken } = res.data.data;
          set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false });
          throw new Error(err.response?.data?.message || 'Registration failed. Please try again.');
        }
      },

      logout: () => {
        const { refreshToken } = get();
        if (refreshToken) {
          api.post('/auth/logout', { refreshToken }).catch(() => {});
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) throw new Error('No refresh token');
        const res = await api.post('/auth/refresh-token', { refreshToken });
        const { accessToken } = res.data.data;
        set({ accessToken });
      },
    }),
    {
      name: 'employiq-auth',
      partialState: (state: AuthState) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
