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

    return data[4].id
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

async function processData(data) {
    const results = []
    const tags = {}
    const currency = data.lines
    const league = await getLeague()
    let chaosToBuy = 0
    let buyChaos = 0
    let buyItem = 0
    let sellChaos = 0
    let sellItem = 0
    let icon = ''
    let buyCount = 0
    let sellCount = 0
    let buyLink = ""
    let sellLink = ""
    let tag = ""
    let profit = 0
    const chaosIcon = data.currencyDetails[0].icon

    // Create initial tag list
    for (item of currency) {
        tags[item.currencyTypeName] = item.detailsId
    }

    // Revise currency tag list to work with bulk exchange
    if (currency[0].currencyTypeName == "Mirror of Kalandra") {
        tags['Mirror of Kalandra'] = 'mirror'
        tags['Exalted Orb'] = 'exalted'
        tags['Blessing of Chayula'] = 'blessing-chayula'
        tags['Divine Orb'] = 'divine'
        tags['Blessing of Tul'] = 'blessing-tul'
        tags['Blessing of Esh'] = 'blessing-esh'
        tags['Blessing of Uul-Netol'] = 'blessing-uul-netol'
        tags['Orb of Annulment'] = 'annul'
        tags['Splinter of Chayula'] = 'splinter-chayula'
        tags['Orb of Scouring'] = 'scour'
        tags['Awakened Sextant'] = 'master-sextant'
        tags['Orb of Alteration'] = 'alt'
        tags["Blacksmith's Whetstone"] = 'whetstone'
        tags["Gemcutter's Prism"] = 'gcp'
        tags['Chromatic Orb'] = 'chrome'
        tags['Prime Sextant'] = 'journeyman-sextant'
        tags['Orb of Alchemy'] = 'alch'
        tags['Vaal Orb'] = 'vaal'
        tags['Splinter of Uul-Netol'] = 'splinter-uul'
        tags['Silver Coin'] = 'silver'
        tags['Orb of Chance'] = 'chance'
        tags['Orb of Augmentation'] = 'aug'
        tags["Jeweller's Orb"] = 'jewellers'
        tags['Splinter of Tul'] = 'splinter-tul'
        tags['Simple Sextant'] = 'apprentice-sextant'
        tags['Splinter of Esh'] = 'splinter-esh'
        tags['Regal Orb'] = 'regal'
        tags['Orb of Transmutation'] = 'transmute'
        tags['Portal Scroll'] = 'portal'
        tags['Splinter of Xoph'] = 'splinter-xoph'
        tags['Blessed Orb'] = 'blessed'
        tags["Cartographer's Chisel"] = 'chisel'
        tags["Glassblower's Bauble"] = 'bauble'
        tags['Scroll of Wisdom'] = 'wisdom'
        tags["Armourer's Scrap"] = 'scrap'
        tags["Engineer's Orb"] = 'engineers'
        tags['Perandus Coin'] = 'p'
    }
    
    // Get pricing data
    for (item of currency) {
        // Create buy/sell links
        tag = tags[item.currencyTypeName]
        buyLink = `https://www.pathofexile.com/trade/exchange/${league}?q={"exchange":{"status":{"option":"online"},"have":["chaos"],"want":["${tag}"]}}`
        sellLink = `https://www.pathofexile.com/trade/exchange/${league}?q={"exchange":{"status":{"option":"online"},"have":["${tag}"],"want":["chaos"]}}`

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
            // If 1 chaos buys less than 1 currency, display how much chaos you will get by selling 1 currency
            if (chaosToSell < 1) {
                sellItem = (1).toFixed(1)
                sellChaos = kFormatter((Math.round(((1 / chaosToSell) + Number.EPSILON) * 10) / 10).toFixed(1))
                
            } else {
                sellChaos = (1).toFixed(1)
                sellItem = kFormatter((Math.round((chaosToSell + Number.EPSILON) * 10) / 10).toFixed(1))
            }
            sellCount = item.pay.count
        }

        // Calculate profit
        if (chaosToBuy == null || chaosToSell == null) {
            profit = null
        } 
        else if (chaosToBuy > 1) {
            profit = kFormatter((Math.round(((1 / chaosToSell) - chaosToBuy + Number.EPSILON) * 10) / 10).toFixed(1))
        } else {
            profit = kFormatter((Math.round((buyItem - sellItem  + Number.EPSILON) * 10) / 10).toFixed(1))
        }

        icon = data.currencyDetails[data.currencyDetails.findIndex(
            function(currency){ 
                return currency.name === item.currencyTypeName })].icon
        results.push({
            name : item.currencyTypeName,
            buyChaos : buyChaos,
            buyItem : buyItem,
            buyCount: buyCount,
            buyLink: buyLink,
            sellChaos: sellChaos,
            sellItem: sellItem,
            sellCount: sellCount,
            sellLink: sellLink,
            icon : icon,
            chaosIcon : chaosIcon,
            profit: profit
        })
    }
    return results
}

router.get('/', async (req, res) => {
    console.log('/challenge endpoint called')
    const dataCurrency = await getData('Currency')
    const currency = processData(dataCurrency)
    res.render('leagues/challenge/currency', {currency:currency})
})

router.get('/currency', async (req, res) => {
    console.log('/challenge/currency endpoint called')
    const dataCurrency = await getData('Currency')
    const currency = await processData(dataCurrency)
    console.log(currency)
    res.render('leagues/challenge/currency', {currency:currency})
})

router.get('/fragment', async (req, res) => {
    console.log('/challenge/fragment endpoint called')
    const dataFragment = await getData('Fragment')
    const fragment = await processData(dataFragment)
    res.render('leagues/challenge/fragment', {fragment:fragment})
})


module.exports = router