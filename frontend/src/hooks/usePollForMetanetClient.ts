/**
 * @file usePollForMetaNetClient.ts
 * @description
 * Custom React hook that continuously polls for the presence of a MetaNet client
 * by running `checkForMetaNetClient()` every few seconds. Updates the
 * `userHasMetanetClient` state in the Auth store when the client is detected or lost.
 */

import { useEffect, useRef } from 'react';
import checkForMetaNetClient from '../utils/checkForMetaNetClient';
import { useAuthStore } from '../stores/stores';

/**
 * usePollForMetaNetClient Hook
 *
 * Starts a polling loop on mount to repeatedly check for the presence of a MetaNet client
 * in the user’s browser environment. Updates Zustand’s `useAuthStore` state with the result.
 *
 * - Polls every 5 seconds (adjustable).
 * - Automatically clears the interval on unmount.
 * - Uses a `Ref` to keep track of the interval ID.
 *
 * @example
 * usePollForMetaNetClient();
 * // This hook does not return anything — it updates global auth state.
 */
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
