import { useState, useCallback } from 'react';

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
}

export const useFileUpload = () => {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
  });

  const uploadFile = useCallback(async (file: File, folder: string = 'uploads'): Promise<string> => {
    setState({ uploading: true, progress: 0, error: null });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/media/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setState({ uploading: false, progress: 100, error: null });
      
      return data.url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setState({ uploading: false, progress: 0, error: errorMessage });
      throw error;
    }
  }, []);

  const uploadMultipleFiles = useCallback(async (files: File[], folder: string = 'uploads'): Promise<string[]> => {
    setState({ uploading: true, progress: 0, error: null });

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/media/upload-multiple`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setState({ uploading: false, progress: 100, error: null });
      
      return data.urls;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setState({ uploading: false, progress: 0, error: errorMessage });
      throw error;
    }
  }, []);

  const uploadVideo = useCallback(async (file: File): Promise<{ videoUrl: string; thumbnailUrl: string }> => {
    setState({ uploading: true, progress: 0, error: null });

    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/media/upload-video`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Video upload failed');
      }

      const data = await response.json();
      setState({ uploading: false, progress: 100, error: null });
      
      return { videoUrl: data.videoUrl, thumbnailUrl: data.thumbnailUrl };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Video upload failed';
      setState({ uploading: false, progress: 0, error: errorMessage });
      throw error;
    }
  }, []);

  return {
    ...state,
    uploadFile,
    uploadMultipleFiles,
    uploadVideo,
  };
};
