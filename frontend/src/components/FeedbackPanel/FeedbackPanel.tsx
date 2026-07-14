import { useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { captureError, captureSignal, submitFeedback } from '../../utils/usercom'
import './FeedbackPanel.scss'

const FeedbackPanel = () => {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('experience')
  const [contactConsent, setContactConsent] = useState(false)

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) captureSignal('feedback.opened', { surface: 'feedback-form' })
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (message.trim().length < 10) {
      toast.warn('Please share at least a sentence so we can act on it.')
      return
    }
    setSubmitting(true)
    captureSignal('feedback.submit_started', { surface: 'feedback-form', tags: [`category:${category}`] })
    try {
      await submitFeedback({ feedback: message, email, category, contactConsent })
      captureSignal('feedback.client_acknowledged', { surface: 'feedback-form', tags: [`category:${category}`] })
      toast.success('Feedback sent. Thank you for helping improve Tempo.')
      setMessage('')
      setOpen(false)
    } catch (error) {
      captureError('feedback.submit_failed', error, { category })
      toast.error('Feedback could not be sent. Please try again shortly.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="feedbackDock">
      {open && (
        <form className="feedbackCard" onSubmit={submit} aria-label="Send Tempo feedback">
          <div className="feedbackHeader">
            <div>
              <p>Help shape Tempo</p>
              <span>Bug, idea, or catalogue issue—we read every note.</span>
            </div>
            <button type="button" onClick={toggle} aria-label="Close feedback">×</button>
          </div>
          <label>
            What is this about?
            <select value={category} onChange={event => setCategory(event.target.value)}>
              <option value="experience">Listening experience</option>
              <option value="catalogue">Song availability</option>
              <option value="publish">Publishing</option>
              <option value="wallet">Wallet permissions or payment</option>
              <option value="idea">Product idea</option>
            </select>
          </label>
          <label>
            Your feedback
            <textarea value={message} onChange={event => setMessage(event.target.value)} rows={5} maxLength={5000} required />
          </label>
          <label>
            Email (optional)
            <input type="email" value={email} onChange={event => setEmail(event.target.value)} />
          </label>
          {email && (
            <label className="consentRow">
              <input type="checkbox" checked={contactConsent} onChange={event => setContactConsent(event.target.checked)} />
              You may contact me about this feedback.
            </label>
          )}
          <button className="feedbackSubmit" disabled={submitting}>{submitting ? 'Sending…' : 'Send feedback'}</button>
        </form>
      )}
      <button className="feedbackToggle" onClick={toggle} aria-expanded={open}>
        {open ? 'Close' : 'Feedback'}
      </button>
    </div>
  )
}

export default FeedbackPanel
