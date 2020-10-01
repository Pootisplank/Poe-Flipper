const express = require('express')
const fetch = require('node-fetch')
const app = express()


function kFormatter(num) {
    return num > 999 ? ((num/1000).toFixed(1)) + 'k' : num
}

// Retrieves data from poe.ninja api
async function getData(type) {
    const url = `https://poe.ninja/api/data/currencyoverview?league=Heist&type=${type}&language=en`
    const options = {
        'method' : 'GET',
    };
    const data = await fetch(url, options)
        .then(res => res.json())
        .catch(error => {
            console.error("Error", error)
        })
    return data
}


function processData(data) {
    const results = []
    const currency = data.lines
    let chaosToBuy = 0
    let buyChaos = 0
    let buyItem = 0
    let sellChaos = 0
    let sellItem = 0
    let icon = ''
    let buyCount = 0
    let sellCount = 0
    const chaosIcon = data.currencyDetails[0].icon

    // Get pricing data
    for (item of currency) {
        // Check if there exists pricing data
        if (item.receive != null) {
            // Amount of chaos needed to buy one currency
            chaosToBuy = item.receive.value
        } else {
            chaosToBuy = null
        }
        if (chaosToBuy == null) {
            buyChaos = null
            buyItem = null
        } else {
            // If currency is worth less than 1 chaos, display how much currency you can buy with 1 chaos.
            if (chaosToBuy < 1) {
                buyChaos = (1).toFixed(1)
                buyItem = kFormatter((Math.round(((1 / chaosToBuy) + Number.EPSILON) * 10) / 10).toFixed(1))
            } else {
                buyChaos = kFormatter((Math.round((chaosToBuy + Number.EPSILON) * 10) / 10).toFixed(1))
                buyItem = (1).toFixed(1)
            }
            buyCount = item.receive.count
        }

        // Amount of currency you can buy with 1 chaos
        if (item.pay != null) {
            var chaosToSell = item.pay.value
        } else {
            chaosToSell = null
        }
        // If there is no sale data, there is not enough data to predict a price
        if (chaosToSell == null) {
            sellItem = null
            sellChaos = null
        } else {
            // If currency sells for less than 1 chaos, display how much currency you need to sell for 1 chaos
            if (chaosToSell < 1) {
                sellItem = (1).toFixed(1)
                sellChaos = kFormatter((Math.round(((1 / chaosToSell) + Number.EPSILON) * 10) / 10).toFixed(1))
                
            } else {
                sellChaos = (1).toFixed(1)
                sellItem = kFormatter((Math.round((chaosToSell + Number.EPSILON) * 10) / 10).toFixed(1))
            }
            sellCount = item.pay.count
        }
        icon = data.currencyDetails[data.currencyDetails.findIndex(
            function(currency){ 
                return currency.name === item.currencyTypeName })].icon
        results.push({
            name : item.currencyTypeName,
            buyChaos : buyChaos,
            buyItem : buyItem,
            buyCount: buyCount,
            sellChaos: sellChaos,
            sellItem: sellItem,
            sellCount: sellCount,
            icon : icon,
            chaosIcon : chaosIcon
        })
    }
    return results
}


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
    const dataCurrency = await getData('Currency')
    const currency = processData(dataCurrency)
    //console.log(result)
    res.render('menu/currency', {currency:currency})
})

app.get('/fragment', async (req, res) => {
    console.log('/fragment endpoint called')
    const dataFragment = await getData('Fragment')
    const fragment = processData(dataFragment)
    //console.log(result)
    res.render('menu/fragment', {fragment:fragment})
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.info(`Listening on port ${PORT}`))
