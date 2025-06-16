import { useEffect, useRef } from 'react';
import checkForMetaNetClient from '../utils/checkForMetaNetClient';
import { useAuthStore } from '../stores/stores';

export const usePollForMetaNetClient = () => {
  const intervalRef = useRef<number | null>(null);
  const setUserHasMetanetClient = useAuthStore((state: any) => state.setUserHasMetanetClient);

  useEffect(() => {
    const pollFunction = async () => {
      const status = await checkForMetaNetClient();
      setUserHasMetanetClient(status !== 0);
    };

    const startPolling = () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = window.setInterval(() => {
        pollFunction();
      }, 5000); // Adjust the interval time as needed
    };

    startPolling();

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [setUserHasMetanetClient]);
};
