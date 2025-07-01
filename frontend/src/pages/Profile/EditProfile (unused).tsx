// import { useRef, useState } from 'react'

// import { MdDateRange } from 'react-icons/md'

// const EditProfile = () => {
// 	const [profileData, setProfileData] = useState({})

// 	const dateOfBirthInputRef = useRef<HTMLInputElement>(null)

// 	const handleIconClick = () => {
// 		console.log('Icon clicked, current ref:', dateOfBirthInputRef.current)
// 		if (dateOfBirthInputRef.current) {
// 			console.log('Triggering click on date input')
// 			dateOfBirthInputRef.current.click()
// 		} else {
// 			console.log('Ref is null, cannot trigger click')
// 		}
// 	}

// 	// TODO: complete submit handler
// 	const handleSubmit = (e: any) => {
// 		e.preventDefault()
// 	}

// 	return (
// 		<div className="container">
// 			<h1>Edit Profile</h1>

// 			<form className="formContainer" onSubmit={handleSubmit}>
// 				<div className="fieldContainer">
// 					<label>Name</label>
// 					<input type="text" name="name" className="textInput" required />
// 				</div>

// 				<div className="fieldContainer">
// 					<label>Gender</label>
// 					<select name="gender" required>
// 						<option value=""></option>
// 						<option value="Male">Male</option>
// 						<option value="Female">Female</option>
// 						<option value="Non-Binary">Non-Binary</option>
// 						<option value="Other">Other</option>
// 					</select>
// 				</div>

// 				<div className="fieldContainer">
// 					<label htmlFor="dateOfBirth">Date of birth</label>
// 					<input
// 						type="date"
// 						name="dateOfBirth"
// 						className="dateInput"
// 						ref={dateOfBirthInputRef}
// 					/>
// 					<label htmlFor="dateOfBirth" className="dateIconLabel">
// 						<MdDateRange color="white" size={24} className="dateIcon" />
// 					</label>
// 				</div>

// 				<button className="button centerBlock" style={{ marginTop: '1rem' }} type="submit">
// 					Save profile
// 				</button>
// 			</form>
// 		</div>
// 	)
// }

// export default EditProfile
