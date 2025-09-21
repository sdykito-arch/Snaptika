import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      accessToken
      user {
        id
        email
        username
        firstName
        lastName
        bio
        avatar
        verified
        isPrivate
        monetizationStatus
        followersCount
        followingCount
        postsCount
        createdAt
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($createUserInput: CreateUserInput!) {
    register(createUserInput: $createUserInput) {
      accessToken
      user {
        id
        email
        username
        firstName
        lastName
        bio
        avatar
        verified
        isPrivate
        monetizationStatus
        followersCount
        followingCount
        postsCount
        createdAt
      }
    }
  }
`;

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      email
      username
      firstName
      lastName
      bio
      avatar
      verified
      isPrivate
      monetizationStatus
      followersCount
      followingCount
      postsCount
      createdAt
      lastActive
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $updateUserInput: UpdateUserInput!) {
    updateUser(id: $id, updateUserInput: $updateUserInput) {
      id
      email
      username
      firstName
      lastName
      bio
      avatar
      verified
      isPrivate
      monetizationStatus
      followersCount
      followingCount
      postsCount
      createdAt
    }
  }
`;

export const FOLLOW_USER_MUTATION = gql`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId) {
      success
      message
    }
  }
`;

export const UNFOLLOW_USER_MUTATION = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId) {
      success
      message
    }
  }
`;

export const GET_USER_QUERY = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      username
      firstName
      lastName
      bio
      avatar
      verified
      isPrivate
      followersCount
      followingCount
      postsCount
      createdAt
      isFollowing
      isFollowedBy
    }
  }
`;

export const GET_USER_BY_USERNAME_QUERY = gql`
  query GetUserByUsername($username: String!) {
    userByUsername(username: $username) {
      id
      username
      firstName
      lastName
      bio
      avatar
      verified
      isPrivate
      followersCount
      followingCount
      postsCount
      createdAt
      isFollowing
      isFollowedBy
    }
  }
`;

export const SEARCH_USERS_QUERY = gql`
  query SearchUsers($search: String, $skip: Int, $take: Int) {
    users(search: $search, skip: $skip, take: $take) {
      users {
        id
        username
        firstName
        lastName
        avatar
        verified
        followersCount
      }
      total
      hasMore
    }
  }
`;
