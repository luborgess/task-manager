import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  username: string
  password: string
}

interface AuthStore {
  currentUser: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
  canResetStorage: () => boolean
  changePassword: (currentPassword: string, newPassword: string) => boolean
  resetStorage: () => void
}

const ADMIN_USERS = ['Lucas', 'Luiz'];

const defaultUsers: User[] = [
  { username: 'Lucas', password: '123456' },
  { username: 'Luiz', password: '123456' },
  { username: 'Kelvin', password: '123456' },
  { username: 'Bruno', password: '123456' },
  { username: 'Robson', password: '123456' },
  { username: 'Fulano', password: '123456' },
  { username: 'Natan', password: '123456' },
  { username: 'Gabriel', password: '123456' },
  { username: 'Edila', password: '123456' }
];

const getValidUsers = (): User[] => {
  if (typeof window === 'undefined') return defaultUsers;
  
  try {
    const users = window.localStorage.getItem('valid-users');
    if (!users) {
      window.localStorage.setItem('valid-users', JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(users);
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return defaultUsers;
  }
};

const resetStorage = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('valid-users');
    window.localStorage.setItem('valid-users', JSON.stringify(defaultUsers));
  }
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,

      login: (username: string, password: string) => {
        const validUsers = getValidUsers();
        const user = validUsers.find(
          u => u.username.toLowerCase() === username.toLowerCase()
        );

        if (user && user.password === password) {
          set({
            currentUser: user.username,
            isAuthenticated: true
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false
        });
      },

      canResetStorage: () => {
        const state = get();
        return Boolean(state.isAuthenticated && state.currentUser && ADMIN_USERS.includes(state.currentUser));
      },

      changePassword: (currentPassword: string, newPassword: string) => {
        const state = get();
        if (!state.isAuthenticated || !state.currentUser || typeof window === 'undefined') {
          return false;
        }

        if (newPassword.length < 6) {
          return false;
        }

        const validUsers = getValidUsers();
        const userIndex = validUsers.findIndex(
          u => u.username.toLowerCase() === state.currentUser?.toLowerCase()
        );

        if (userIndex === -1 || validUsers[userIndex].password !== currentPassword) {
          return false;
        }

        validUsers[userIndex].password = newPassword;
        window.localStorage.setItem('valid-users', JSON.stringify(validUsers));
        return true;
      },

      resetStorage: () => {
        resetStorage();
        set({
          currentUser: null,
          isAuthenticated: false
        });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)
