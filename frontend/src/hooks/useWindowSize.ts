import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export const useIsMobile = (): boolean => {
  const { width } = useWindowSize();
  return width <= 768;
};

export const useIsTablet = (): boolean => {
  const { width } = useWindowSize();
  return width > 768 && width <= 1024;
};

export const useIsDesktop = (): boolean => {
  const { width } = useWindowSize();
  return width > 1024;
};
