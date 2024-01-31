import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import useAsyncEffect from 'use-async-effect'
import LatestSongs from '../../components/LatestSongs/LastestSongs.tsx'
import checkForRoyalties from '../../utils/checkForRoyalties.ts'
import React from "react"

const Home = () => {
	useAsyncEffect(async () => {
		try {
			const res = await checkForRoyalties()
			if (res.status === 'updatesAvailable') {
				toast.success(res.result)
			}
		} catch (e) {
			console.log((e as Error).message)
		}
	}, [])

	return (
		<>
			<LatestSongs className="mainContent" />
		</>
	)
}
export default Home
