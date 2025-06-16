import { useEffect } from 'react'
import { useAuthStore } from '../stores/stores'
import checkForMetaNetClient from '../utils/checkForMetaNetClient'

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
