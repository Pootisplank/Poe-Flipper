const express = require('express')
const fetch = require('node-fetch')
const app = express()

var data

// Set static assets
app.use(express.static('/public/assets'))
app.use('/img', express.static(__dirname + '/public/assets/img'))
app.use('/styles', express.static(__dirname + '/public/assets/styles'))
app.use('/js', express.static(__dirname + '/public/assets/js'))

// Set Views
app.set('views', './views')
app.set('view engine', 'ejs')

app.get('', (req, res) => {
    res.render('index')
})

app.get('/currency', async (req, res) => {
    console.log('/currency endpoint called')
    const url = "https://poe.ninja/api/data/currencyoverview?league=Harvest&type=Currency&language=en";
    const options = {
        'method' : 'GET',
    };

    const data = await fetch(url, options)
        .then(res => res.json())
        .then(json => json.lines)
        .catch(error => {
            console.error("Error", error)
        })

    res.render('menu/currency', {data:data})
})

app.get('/fragment', (req, res) => {
    res.render('menu/fragment')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.info(`Listening on port ${PORT}`))
