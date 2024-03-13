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

const Home = () => {
  // Global state for Metanet Client presence
  const [userHasMetanetClient, setUserHasMetanetClient] = useAuthStore((state: any) => [
    state.userHasMetanetClient,
    state.setUserHasMetanetClient
  ])

  useAsyncEffect(async () => {
    /* 
      TODO: getNetwork throws error if not logged in. Below uses checkForRoyalties() for user identity instead
      Issue: https://github.com/p2ppsr/dreams/blob/master/src/checkForMetaNetClient.js
      // Doesn't work:
      const babbageNetworkResult = await getNetwork()
      console.log(babbageNetworkResult) 
    */

    try {
      const res = await checkForRoyalties()
      if (res.status === 'updatesAvailable') {
        toast.success(res.result)
      }
      setUserHasMetanetClient(true)
    } catch (e) {
      console.log((e as Error).message)
      setUserHasMetanetClient(false)
    }
  }, [])

  useEffect(() => {
    console.log(userHasMetanetClient)
  }, [userHasMetanetClient])

  return <>{userHasMetanetClient ? <NewReleases /> : <NoMncPreview />}</>
}
export default Home
