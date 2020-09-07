const express = require('express')
const fetch = require('node-fetch')
const app = express()

var obj

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
    fetch("https://poe.ninja/api/data/currencyoverview?league=Harvest&type=Currency&language=en")
        .then(response => response.json())
        .then(data => obj = data)
        .catch(error => console.log('error', error));
    res.render('menu/currency', {currencyData : obj})
})

app.get('/fragment', (req, res) => {
    res.render('menu/fragment')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.info(`Listening on port ${PORT}`))
