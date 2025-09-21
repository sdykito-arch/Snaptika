import { useQuery, useMutation } from '@apollo/client';
import { useAppDispatch } from '../store';
import {
  setPosts,
  addPosts,
  prependPost,
  likePost,
  unlikePost,
  setHasMorePosts,
  setLoading,
  setError,
} from '../store/slices/feedSlice';
import {
  GET_FEED_QUERY,
  GET_POSTS_QUERY,
  LIKE_POST_MUTATION,
  UNLIKE_POST_MUTATION,
  VIEW_POST_MUTATION,
} from '../graphql/queries/posts';
import { showSnackbar } from '../store/slices/uiSlice';

export const useFeed = () => {
  const dispatch = useAppDispatch();

  const { loading, error, fetchMore, refetch } = useQuery(GET_FEED_QUERY, {
    variables: { skip: 0, take: 20 },
    onCompleted: (data) => {
      dispatch(setPosts(data.feed.posts));
      dispatch(setHasMorePosts(data.feed.hasMore));
      dispatch(setLoading(false));
    },
    onError: (error) => {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
    },
  });

  const [likePostMutation] = useMutation(LIKE_POST_MUTATION, {
    onError: (error) => {
      dispatch(showSnackbar({
        message: error.message,
        severity: 'error',
      }));
    },
  });

  const [unlikePostMutation] = useMutation(UNLIKE_POST_MUTATION, {
    onError: (error) => {
      dispatch(showSnackbar({
        message: error.message,
        severity: 'error',
      }));
    },
  });

  const [viewPostMutation] = useMutation(VIEW_POST_MUTATION);

  const loadMorePosts = async (currentPostsLength: number) => {
    try {
      const result = await fetchMore({
        variables: {
          skip: currentPostsLength,
          take: 20,
        },
      });
      
      if (result.data) {
        dispatch(addPosts(result.data.feed.posts));
        dispatch(setHasMorePosts(result.data.feed.hasMore));
      }
    } catch (error) {
      console.error('Failed to load more posts:', error);
    }
  };

  const toggleLike = async (postId: string, isLiked: boolean) => {
    // Optimistic update
    if (isLiked) {
      dispatch(unlikePost(postId));
    } else {
      dispatch(likePost(postId));
    }

    try {
      if (isLiked) {
        await unlikePostMutation({ variables: { postId } });
      } else {
        await likePostMutation({ variables: { postId } });
      }
    } catch (error) {
      // Revert optimistic update on error
      if (isLiked) {
        dispatch(likePost(postId));
      } else {
        dispatch(unlikePost(postId));
      }
    }
  };

  const recordView = async (postId: string, duration: number = 0) => {
    try {
      await viewPostMutation({
        variables: {
          viewPostInput: { postId, duration },
        },
      });
    } catch (error) {
      console.error('Failed to record view:', error);
    }
  };

  const refreshFeed = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refresh feed:', error);
    }
  };

  return {
    loading,
    error,
    loadMorePosts,
    toggleLike,
    recordView,
    refreshFeed,
  };
};

export const usePosts = (filters?: {
  hashtag?: string;
  userId?: string;
}) => {
  const dispatch = useAppDispatch();

  const { loading, error, fetchMore, refetch } = useQuery(GET_POSTS_QUERY, {
    variables: {
      ...filters,
      skip: 0,
      take: 20,
    },
    onCompleted: (data) => {
      dispatch(setPosts(data.posts.posts));
      dispatch(setHasMorePosts(data.posts.hasMore));
    },
    onError: (error) => {
      dispatch(setError(error.message));
    },
  });

  const loadMorePosts = async (currentPostsLength: number) => {
    try {
      const result = await fetchMore({
        variables: {
          ...filters,
          skip: currentPostsLength,
          take: 20,
        },
      });
      
      if (result.data) {
        dispatch(addPosts(result.data.posts.posts));
        dispatch(setHasMorePosts(result.data.posts.hasMore));
      }
    } catch (error) {
      console.error('Failed to load more posts:', error);
    }
  };

  return {
    loading,
    error,
    loadMorePosts,
    refetch,
  };
};
