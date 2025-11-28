require('dotenv').config()
const express = require('express')
const cors = require('cors')
const pinoHttp = require('pino-http')
const logger = require('./logger')
const path = require('path')
const connectToDatabase = require('./models/db')
const { loadData } = require('./util/import-mongo/index')

const pinoLogger = require('./logger')

const secondChanceRoutes = require('./routes/secondChanceItemsRoutes')
const authRoutes = require('./routes/authRoutes')
const searchRoutes = require('./routes/searchRoutes')

const app = express()
const port = 3060

app.use('*', cors())
app.use(express.json())
app.use(pinoHttp({ logger }))

// Serve static files (images, public assets)
app.use(express.static(path.join(__dirname, 'public')))

// Use Routes
app.use('/api/secondchance/items', secondChanceRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/secondchance/search', searchRoutes)

app.get('/', (req, res) => {
  res.send('Inside the server')
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).send('Internal Server Error')
})

// Connect to MongoDB; we just do this one time
connectToDatabase().then(async () => {
  pinoLogger.info('Connected to DB')

  // Load initial data here
  await loadData()
  pinoLogger.info('Data import completed.')

  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
})
.catch((e) => console.error('Failed to connect to DB', e))

module.exports = app;