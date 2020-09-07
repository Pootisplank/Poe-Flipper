const express = require('express')
const app = express()
const port = 3000

app.use(express.static('/src/assets'))
app.use('/img', express.static(__dirname + '/src/assets/img'))
app.use('/styles', express.static(__dirname + '/src/assets/styles'))

// Set Views
app.set('views', './views')
app.set('view engine', 'ejs')

app.get('', (req, res) => {
    res.render('index')
})
app.get('/currency', (req, res) => {
    res.render('menu/currency')
})
app.get('/fragment', (req, res) => {
    res.render('menu/fragment')
})

app.listen(port, () => console.info(`Listening on port ${port}`))
