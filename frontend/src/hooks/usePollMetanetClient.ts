/**
 * @file usePollMetanetClient.ts
 * @description
 * Custom React hook that polls for the presence of a MetaNet client on a fixed interval.
 * Sets the `userHasMetanetClient` flag in Zustand’s Auth store to reflect whether
 * the client is currently detected.
 */

import { useEffect } from 'react'
import { useAuthStore } from '../stores/stores'
import checkForMetaNetClient from '../utils/checkForMetaNetClient'

/**
 * usePollMetanetClient Hook
 *
 * - Checks for the presence of the MetaNet client immediately on mount.
 * - Continues polling every 3 seconds by calling `checkForMetaNetClient()`.
 * - Updates Zustand’s `userHasMetanetClient` state based on whether the client is detected.
 * - Cleans up the polling interval on unmount.
 *
 * @example
 * usePollMetanetClient();
 * // Automatically keeps global auth state up-to-date with MetaNet client availability.
 */
export const usePollMetanetClient = () => {
  const [_userHasMetanetClient, setUserHasMetanetClient] = useAuthStore((state: any) => [
    state.userHasMetanetClient,
    state.setUserHasMetanetClient
  ])

  useEffect(() => {
    const checkAndSetMetanetClientStatus = async () => {
      const status = await checkForMetaNetClient()
      setUserHasMetanetClient(status !== 0)
    }

    checkAndSetMetanetClientStatus()

    const intervalId = setInterval(() => {
      checkAndSetMetanetClientStatus()
    }, 3000)

    return () => clearInterval(intervalId)
  }, [setUserHasMetanetClient])
}
