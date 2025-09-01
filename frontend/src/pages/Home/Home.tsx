/**
 * @file Home.tsx
 * @description
 * Home page component for the Tempo application.
 * Displays either the latest releases or a prompt to install MetaNet Client,
 * depending on the user’s MetaNet client status.
 *
 * - Polls the server for royalty updates once on mount.
 * - Notifies the user with a toast if royalties need to be paid.
 */

import { useEffect } from 'react'
import 'react-toastify/dist/ReactToastify.css'

// Global state
import { useAuthStore } from '../../stores/stores'

// Components
import NewReleases from '../../components/NewReleases/NewReleases'
import NoMncPreview from '../NoMncPreview/NoMncPreview'

// Utils
import checkForRoyalties from '../../utils/checkForRoyalties'

/**
 * Home Component
 *
 * - Uses Zustand’s `useAuthStore` to determine if the user has MetaNet Client installed.
 * - If the client is available, shows the `NewReleases` component.
 * - Otherwise, displays the `NoMncPreview` component encouraging the user to install MetaNet Client.
 * - On initial mount, checks for unpaid royalties and displays a toast notification if updates are found.
 */
const Home = () => {
  const [userHasMetanetClient] = useAuthStore((state: any) => [
    state.userHasMetanetClient
  ])

  useEffect(() => {
    const checkRoyalties = async () => {
      try {
        await checkForRoyalties()
      } catch (e) {
        console.error((e as Error).message)
      }
    }

    checkRoyalties()
  }, [])

  return <>{userHasMetanetClient ? <NewReleases /> : <NoMncPreview />}</>
}

export default Home
