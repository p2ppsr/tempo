/**
 * @file PublishSuccess.tsx
 * @description
 * React component for displaying a confirmation screen
 * after a song has been successfully published.
 * Informs the user that royalties will be automatically paid.
 */

import './PublishSuccess.scss'

/**
 * SuccessPage Component
 *
 * Renders a simple confirmation page after successful song publication,
 * notifying the user that royalties will accrue automatically.
 */
const SuccessPage = () => {
  return (
    <div className="container">
      <h1 style={{ marginBottom: '1rem' }}>Publish Successful! 🎉</h1>
      <h3>Royalties will be automatically paid to your account per listen.</h3>
    </div>
  )
}
export default SuccessPage
