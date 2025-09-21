import { gql } from '@apollo/client';

export const GET_STORIES_QUERY = gql`
  query GetStories($skip: Int, $take: Int) {
    stories(skip: $skip, take: $take) {
      stories {
        id
        authorId
        mediaUrl
        mediaType
        caption
        duration
        viewsCount
        createdAt
        expiresAt
        author {
          id
          username
          firstName
          lastName
          avatar
          verified
        }
        isViewed
      }
      total
      hasMore
    }
  }
`;

export const GET_USER_STORIES_QUERY = gql`
  query GetUserStories($userId: ID!, $skip: Int, $take: Int) {
    userStories(userId: $userId, skip: $skip, take: $take) {
      stories {
        id
        authorId
        mediaUrl
        mediaType
        caption
        duration
        viewsCount
        createdAt
        expiresAt
        author {
          id
          username
          firstName
          lastName
          avatar
          verified
        }
        isViewed
      }
      total
      hasMore
    }
  }
`;

export const GET_STORY_QUERY = gql`
  query GetStory($id: ID!) {
    story(id: $id) {
      id
      authorId
      mediaUrl
      mediaType
      caption
      duration
      viewsCount
      createdAt
      expiresAt
      author {
        id
        username
        firstName
        lastName
        avatar
        verified
      }
      isViewed
    }
  }
`;

export const CREATE_STORY_MUTATION = gql`
  mutation CreateStory($createStoryInput: CreateStoryInput!) {
    createStory(createStoryInput: $createStoryInput) {
      id
      authorId
      mediaUrl
      mediaType
      caption
      duration
      viewsCount
      createdAt
      expiresAt
      author {
        id
        username
        firstName
        lastName
        avatar
        verified
      }
      isViewed
    }
  }
`;

export const DELETE_STORY_MUTATION = gql`
  mutation DeleteStory($id: ID!) {
    removeStory(id: $id) {
      success
      message
    }
  }
`;

export const VIEW_STORY_MUTATION = gql`
  mutation ViewStory($storyId: ID!) {
    viewStory(storyId: $storyId) {
      success
      message
    }
  }
`;

export const GET_STORY_VIEWERS_QUERY = gql`
  query GetStoryViewers($storyId: ID!, $skip: Int, $take: Int) {
    storyViewers(storyId: $storyId, skip: $skip, take: $take) {
      id
      username
      firstName
      lastName
      avatar
      verified
      viewedAt
    }
  }
`;
