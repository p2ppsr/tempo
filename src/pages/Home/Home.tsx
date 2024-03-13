// Dependencies
import React, { useEffect } from 'react'
import useAsyncEffect from 'use-async-effect'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuthStore } from '../../stores/stores.ts'

// Components
import NewReleases from '../../components/NewReleases/NewReleases.tsx'
import NoMncPreview from '../NoMncPreview/NoMncPreview.tsx'

import { getNetwork } from '@babbage/sdk-ts'

// Utils
import checkForRoyalties from '../../utils/checkForRoyalties.ts'
import checkForMetaNetClient from "../../utils/checkForMetaNetClient.ts"

const Home = () => {
  // Global state for Metanet Client presence
  const [userHasMetanetClient, setUserHasMetanetClient] = useAuthStore((state: any) => [
    state.userHasMetanetClient,
    state.setUserHasMetanetClient
  ])

  useAsyncEffect(async () => {
    
    // Check if user is logged into MNC and set global state
    const userHasMnC = await checkForMetaNetClient() // returns 1 if mainline, -1 if stageline, 0 if neither
    setUserHasMetanetClient(userHasMnC !== 0)

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
