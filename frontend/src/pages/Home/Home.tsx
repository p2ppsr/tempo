import { useEffect } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Global state
import { useAuthStore } from '../../stores/stores'

// Components
import NewReleases from '../../components/NewReleases/NewReleases'
import NoMncPreview from '../NoMncPreview/NoMncPreview'

// Utils
import checkForRoyalties from '../../utils/checkForRoyalties'

const Home = () => {
  const [userHasMetanetClient] = useAuthStore((state: any) => [
    state.userHasMetanetClient
  ])

  useEffect(() => {
    const checkRoyalties = async () => {
      try {
        const res = await checkForRoyalties()
        if (res.status === 'updatesAvailable') {
          toast.success(res.result)
        }
      } catch (e) {
        console.error((e as Error).message)
      }
    }

    checkRoyalties()
  }, [])

  return <>{userHasMetanetClient ? <NewReleases /> : <NoMncPreview />}</>
}

export default Home
