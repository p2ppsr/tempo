import './Profile.scss'
// import image from '../../Images/placeholder-image.png'
import 'react-toastify/dist/ReactToastify.css'
// import { getPublicKey } from '@babbage/sdk'
import placeholderArtistImage from '../../assets/Images/placeholder-image.png'
import { useAuthStore } from '../../stores/stores'
import { Img } from 'uhrp-react'
import constants from '../../utils/constants'
import { useNavigate } from 'react-router'
import React from 'react'

const Profile = () => {
  const navigate = useNavigate()

  const [userName, profilePictureUrl] = useAuthStore((state: any) => [
    state.userName,
    state.profilePictureUrl
  ])

  // TODO: Refactor for profile updating.
  // const [song, setPlaybackSong] = useState({
  //   title: '',
  //   artist: '',
  //   selectedArtwork: null,
  //   selectedMusic: null,
  //   isPublished: false
  // })
  // const [identityKey, setIdentityKey] = useState('')

  // const handleChange = (e) => {
  //   const valueToUpdate = e.target.name === 'selectedArtwork' || e.target.name === 'selectedMusic' ? e.target.files[0] : e.target.value
  //   setPlaybackSong({
  //     ...song,
  //     [e.target.name]: valueToUpdate
  //   })
  // }
  // const navigate = useNavigate()

  // useEffect(async () => {
  //   const key = await getPublicKey({ protocolID: 'Tempo', keyID: '1' })
  //   console.log(key)
  //   setIdentityKey(key)
  // }, [])

  // const onFileUpload = (e) => {
  //   try {
  //     // Create an object of formData
  //     const formData = new FormData()

  //     // Update the formData object
  //     formData.append(
  //       'myAlbumArtwork',
  //       song.selectedArtwork,
  //       song.selectedArtwork.name
  //     )
  //     formData.append(
  //       'myMusic',
  //       song.selectedMusic,
  //       song.selectedMusic.name
  //     )

  //     // Details of the uploaded file
  //     formData.forEach((value) => {
  //       console.log(value)
  //     })
  //     song.isPublished = true
  //     toast.success('Song publishing coming soon!')
  //   } catch (error) {
  //     toast.error('Please select a valid file to upload!')
  //   }

  //   // TODO: Make some API call to upload the selected file.
  //   // Nanostream via parapet or boomerang?
  //   // const history = useHistory()
  //   // if (song.isPublished) {
  //   //   console.log('success')
  //   //   navigate('/PublishASong/Success')
  //   // }
  // }

  return (
    <>
      <div className="container">
        <div className="flex-wrap">
          <Img
            alt="artist"
            src={profilePictureUrl}
            id={''}
            className="profileImage"
            confederacyHost={constants.confederacyURL}
          />
          <div style={{ padding: '1rem' }}>
            <h1>{userName}</h1>
            <p className="whiteText">
              Listener profile info such as top artists, tracks, followers, following etc. will go
              here.
            </p>
            {/* <button
							className="button"
							style={{ marginTop: '3rem' }}
							onClick={() => {
								navigate('/EditProfile')
							}}
						>
							Edit Profile
						</button> */}
          </div>
        </div>
      </div>
    </>
  )
}
export default Profile
