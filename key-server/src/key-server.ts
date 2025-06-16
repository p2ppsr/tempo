import express from 'express'

const router = express.Router()

// Health check route
router.get('/health', (req, res) => {
  res.send('Key server is healthy!')
})

export default router
