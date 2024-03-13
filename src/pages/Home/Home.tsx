// Dependencies
import React from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import useAsyncEffect from 'use-async-effect'
import { useAuthStore } from '../../stores/stores.ts'

// Components
import NewReleases from '../../components/NewReleases/NewReleases.tsx'
import NoMncPreview from '../NoMncPreview/NoMncPreview.tsx'


// Utils
import checkForRoyalties from '../../utils/checkForRoyalties.ts'

const Home = () => {
  // Global state for Metanet Client presence
  const [userHasMetanetClient, setUserHasMetanetClient] = useAuthStore((state: any) => [
    state.userHasMetanetClient,
    state.setUserHasMetanetClient
  ])

  useAsyncEffect(async () => {

    // Check for royalties and alert user if updates are present
    try {
      const res = await checkForRoyalties()
      if (res.status === 'updatesAvailable') {
        toast.success(res.result)
      }
    } catch (e) {
      console.log((e as Error).message)
    }
  }, [])

  return <>{userHasMetanetClient ? <NewReleases /> : <NoMncPreview />}</>
}
export default Home
