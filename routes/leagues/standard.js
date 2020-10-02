const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')


function kFormatter(num) {
    return num > 999 ? ((num/1000).toFixed(1)) + 'k' : num
}

async function getLeague() {
    const url = "http://api.pathofexile.com/leagues"
    const options = {
        'method' : 'GET',
    };
    const data = await fetch(url, options)
        .then(res => res.json())
        .catch(error => {
            console.error("Error", error)
        })

    return data[0].id
}

// Retrieves data from poe.ninja api
async function getData(type) {
    const league = await getLeague()
    const url = `https://poe.ninja/api/data/currencyoverview?league=${league}&type=${type}&language=en`
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

router.get('/', async (req, res) => {
    console.log('/standard endpoint called')
    const dataCurrency = await getData('Currency')
    const currency = processData(dataCurrency)
    res.render('leagues/standard/currency', {currency:currency})
})

router.get('/currency', async (req, res) => {
    console.log('/standard/currency endpoint called')
    const dataCurrency = await getData('Currency')
    const currency = processData(dataCurrency)
    res.render('leagues/standard/currency', {currency:currency})
})

router.get('/fragment', async (req, res) => {
    console.log('/standard/fragment endpoint called')
    const dataFragment = await getData('Fragment')
    const fragment = processData(dataFragment)
    res.render('leagues/standard/fragment', {fragment:fragment})
})


module.exports = router