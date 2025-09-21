import { gql } from '@apollo/client';

export const GET_FEED_QUERY = gql`
  query GetFeed($skip: Int, $take: Int) {
    feed(skip: $skip, take: $take) {
      posts {
        id
        authorId
        caption
        mediaUrls
        mediaType
        duration
        hashtags
        location
        likesCount
        commentsCount
        viewsCount
        sharesCount
        createdAt
        updatedAt
        author {
          id
          username
          firstName
          lastName
          avatar
          verified
        }
        isLiked
        isViewed
      }
      total
      hasMore
    }
  }
`;

export const GET_POSTS_QUERY = gql`
  query GetPosts($hashtag: String, $userId: String, $skip: Int, $take: Int) {
    posts(hashtag: $hashtag, userId: $userId, skip: $skip, take: $take) {
      posts {
        id
        authorId
        caption
        mediaUrls
        mediaType
        duration
        hashtags
        location
        likesCount
        commentsCount
        viewsCount
        sharesCount
        createdAt
        updatedAt
        author {
          id
          username
          firstName
          lastName
          avatar
          verified
        }
        isLiked
        isViewed
      }
      total
      hasMore
    }
  }
`;

export const GET_POST_QUERY = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      authorId
      caption
      mediaUrls
      mediaType
      duration
      hashtags
      location
      likesCount
      commentsCount
      viewsCount
      sharesCount
      createdAt
      updatedAt
      author {
        id
        username
        firstName
        lastName
        avatar
        verified
      }
      isLiked
      isViewed
    }
  }
`;

export const CREATE_POST_MUTATION = gql`
  mutation CreatePost($createPostInput: CreatePostInput!) {
    createPost(createPostInput: $createPostInput) {
      id
      authorId
      caption
      mediaUrls
      mediaType
      duration
      hashtags
      location
      likesCount
      commentsCount
      viewsCount
      sharesCount
      createdAt
      updatedAt
      author {
        id
        username
        firstName
        lastName
        avatar
        verified
      }
      isLiked
      isViewed
    }
  }
`;

export const UPDATE_POST_MUTATION = gql`
  mutation UpdatePost($id: ID!, $updatePostInput: UpdatePostInput!) {
    updatePost(id: $id, updatePostInput: $updatePostInput) {
      id
      authorId
      caption
      mediaUrls
      mediaType
      duration
      hashtags
      location
      likesCount
      commentsCount
      viewsCount
      sharesCount
      createdAt
      updatedAt
      author {
        id
        username
        firstName
        lastName
        avatar
        verified
      }
    }
  }
`;

export const DELETE_POST_MUTATION = gql`
  mutation DeletePost($id: ID!) {
    removePost(id: $id) {
      success
      message
    }
  }
`;

export const LIKE_POST_MUTATION = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      success
      message
    }
  }
`;

export const UNLIKE_POST_MUTATION = gql`
  mutation UnlikePost($postId: ID!) {
    unlikePost(postId: $postId) {
      success
      message
    }
  }
`;

export const VIEW_POST_MUTATION = gql`
  mutation ViewPost($viewPostInput: ViewPostInput!) {
    viewPost(viewPostInput: $viewPostInput) {
      success
      message
    }
  }
`;
