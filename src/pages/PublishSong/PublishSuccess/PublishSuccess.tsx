import React, { useState } from "react"
import "./PublishSuccess.scss"

const SuccessPage = () => {
  // TODO: validation?
  return (
    <div className="Success">
      <div className="menuAndContentSection">
        <div className="mainContent">
          <div className="">
            <h1>Publish A Song</h1>
            <p className="subTitle">
              Become your own publisher and upload your music for the world to
              hear!
            </p>
          </div>
          <div className="uploadSection">
            <h2 className="maintext">
              Congrats, your song was successfully published! 🎉
            </h2>
            <h3 className="maintext">
              Royalties will be automatically paid to your account per listen.
            </h3>
          </div>
        </div>
      </div>
      <div className="background" />
    </div>
  )
}
export default SuccessPage