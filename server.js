const express = require('express')
const fetch = require('node-fetch')
const app = express()
const expressLayouts = require('express-ejs-layouts')

const indexRouter = require('./routes/index')
const challengeRouter = require('./routes/leagues/challenge')
const challengeHCRouter = require('./routes/leagues/challengehc')
const standardRouter = require('./routes/leagues/standard')
const standardHCRouter = require('./routes/leagues/standardhc')

// Set static assets
app.use(express.static('/public/assets'))
app.use('/img', express.static(__dirname + '/public/assets/img'))
app.use('/styles', express.static(__dirname + '/public/assets/styles'))
app.use('/js', express.static(__dirname + '/public/assets/js'))

// Set Views
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)

// Routes
app.use('/', indexRouter)
app.use('/challenge', challengeRouter)
app.use('/challengehc', challengeHCRouter)
app.use('/standard', standardRouter)
app.use('/standardhc', standardHCRouter)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.info(`Listening on port ${PORT}`))
