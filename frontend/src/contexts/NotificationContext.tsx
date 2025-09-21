import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../store';
import {
  addNotification,
  setNotifications,
  addNotifications,
  markAsRead,
  markAllAsRead,
  setUnreadCount,
  setLoading,
  setHasMore,
} from '../store/slices/notificationSlice';
import {
  GET_NOTIFICATIONS_QUERY,
  GET_UNREAD_COUNT_QUERY,
  MARK_NOTIFICATION_READ_MUTATION,
  MARK_ALL_NOTIFICATIONS_READ_MUTATION,
} from '../graphql/queries/notifications';
import { showSnackbar } from '../store/slices/uiSlice';

interface NotificationContextType {
  loadMoreNotifications: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { notifications } = useAppSelector((state) => state.notifications);

  // Get notifications
  const { loading, fetchMore, refetch } = useQuery(GET_NOTIFICATIONS_QUERY, {
    variables: { skip: 0, take: 20 },
    skip: !isAuthenticated,
    onCompleted: (data) => {
      dispatch(setNotifications(data.notifications.notifications));
      dispatch(setUnreadCount(data.notifications.unreadCount));
      dispatch(setHasMore(data.notifications.hasMore));
      dispatch(setLoading(false));
    },
    onError: (error) => {
      console.error('Failed to fetch notifications:', error);
      dispatch(setLoading(false));
    },
  });

  // Get unread count
  useQuery(GET_UNREAD_COUNT_QUERY, {
    skip: !isAuthenticated,
    pollInterval: 30000, // Poll every 30 seconds
    onCompleted: (data) => {
      dispatch(setUnreadCount(data.unreadNotificationsCount));
    },
  });

  // Mark as read mutation
  const [markAsReadMutation] = useMutation(MARK_NOTIFICATION_READ_MUTATION, {
    onCompleted: () => {
      // Optimistic update handled in the function
    },
    onError: (error) => {
      console.error('Failed to mark notification as read:', error);
      dispatch(showSnackbar({
        message: 'Failed to mark notification as read',
        severity: 'error',
      }));
    },
  });

  // Mark all as read mutation
  const [markAllAsReadMutation] = useMutation(MARK_ALL_NOTIFICATIONS_READ_MUTATION, {
    onCompleted: () => {
      dispatch(markAllAsRead());
      dispatch(showSnackbar({
        message: 'All notifications marked as read',
        severity: 'success',
      }));
    },
    onError: (error) => {
      console.error('Failed to mark all notifications as read:', error);
      dispatch(showSnackbar({
        message: 'Failed to mark all notifications as read',
        severity: 'error',
      }));
    },
  });

  const loadMoreNotifications = async () => {
    try {
      const result = await fetchMore({
        variables: {
          skip: notifications.length,
          take: 20,
        },
      });
      
      if (result.data) {
        dispatch(addNotifications(result.data.notifications.notifications));
        dispatch(setHasMore(result.data.notifications.hasMore));
      }
    } catch (error) {
      console.error('Failed to load more notifications:', error);
      dispatch(showSnackbar({
        message: 'Failed to load more notifications',
        severity: 'error',
      }));
    }
  };

  const markNotificationAsRead = async (id: string) => {
    // Optimistic update
    dispatch(markAsRead(id));
    
    try {
      await markAsReadMutation({
        variables: { id },
      });
    } catch (error) {
      // Error handled in onError callback
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await markAllAsReadMutation();
    } catch (error) {
      // Error handled in onError callback
    }
  };

  const refreshNotifications = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  };

  useEffect(() => {
    dispatch(setLoading(loading));
  }, [loading, dispatch]);

  const value = {
    loadMoreNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
