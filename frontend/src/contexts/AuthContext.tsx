import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../store';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  updateUser,
} from '../store/slices/authSlice';
import { GET_ME_QUERY, LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/queries/auth';
import { showSnackbar } from '../store/slices/uiSlice';

interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;
  logout: () => void;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  // Get current user if authenticated
  const { refetch: refetchUser } = useQuery(GET_ME_QUERY, {
    skip: !isAuthenticated || !token,
    onCompleted: (data) => {
      if (data.me) {
        dispatch(updateUser(data.me));
      }
    },
    onError: (error) => {
      console.error('Failed to fetch user:', error);
      if (error.message.includes('Unauthorized')) {
        dispatch(logoutAction());
      }
    },
  });

  // Login mutation
  const [loginMutation] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      dispatch(loginSuccess({
        user: data.login.user,
        token: data.login.accessToken,
      }));
      dispatch(showSnackbar({
        message: 'Login successful!',
        severity: 'success',
      }));
    },
    onError: (error) => {
      dispatch(loginFailure(error.message));
      dispatch(showSnackbar({
        message: error.message,
        severity: 'error',
      }));
    },
  });

  // Register mutation
  const [registerMutation] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      dispatch(loginSuccess({
        user: data.register.user,
        token: data.register.accessToken,
      }));
      dispatch(showSnackbar({
        message: 'Registration successful!',
        severity: 'success',
      }));
    },
    onError: (error) => {
      dispatch(loginFailure(error.message));
      dispatch(showSnackbar({
        message: error.message,
        severity: 'error',
      }));
    },
  });

  const login = async (email: string, password: string) => {
    dispatch(loginStart());
    try {
      await loginMutation({
        variables: {
          loginInput: { email, password },
        },
      });
    } catch (error) {
      // Error handled in onError callback
    }
  };

  const register = async (userData: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    dispatch(loginStart());
    try {
      await registerMutation({
        variables: {
          createUserInput: userData,
        },
      });
    } catch (error) {
      // Error handled in onError callback
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    dispatch(showSnackbar({
      message: 'Logged out successfully',
      severity: 'info',
    }));
  };

  const value = {
    login,
    register,
    logout,
    refetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
