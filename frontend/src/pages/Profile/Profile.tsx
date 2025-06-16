import './Profile.scss'
import placeholderImage from '../../assets/Images/placeholder-image.png'
import 'react-toastify/dist/ReactToastify.css'
import { useAuthStore } from '../../stores/stores'

const Profile = () => {
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
        <img
          alt="artist"
          src={profilePictureUrl || placeholderImage}
          className="profileImage"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            const target = e.target as HTMLImageElement
            target.src = placeholderImage
          }}
        />
        <div style={{ padding: '1rem' }}>
          <h1>{userName}</h1>
          <p>
            Listener profile info such as top artists, tracks, followers, following etc. will go
            here.
          </p>
          {/* 
          <button
            className="button"
            style={{ marginTop: '3rem' }}
            onClick={() => {
              navigate('/EditProfile')
            }}
          >
            Edit Profile
          </button> 
          */}
        </div>
      </div>
    </>
  )
}
export default Profile
