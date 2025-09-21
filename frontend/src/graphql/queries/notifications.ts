import { gql } from '@apollo/client';

export const GET_NOTIFICATIONS_QUERY = gql`
  query GetNotifications($skip: Int, $take: Int) {
    notifications(skip: $skip, take: $take) {
      notifications {
        id
        senderId
        receiverId
        type
        title
        message
        data
        isRead
        createdAt
        sender {
          id
          username
          firstName
          lastName
          avatar
        }
      }
      total
      unreadCount
      hasMore
    }
  }
`;

export const GET_UNREAD_COUNT_QUERY = gql`
  query GetUnreadNotificationsCount {
    unreadNotificationsCount
  }
`;

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      success
      message
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ_MUTATION = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead {
      success
      message
    }
  }
`;
