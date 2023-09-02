var wtj = require('website-to-json')
var axios = require('axios')
const nodeFlags = require('node-flag')
const { code, mode } = nodeFlags.getAll()
const { missing_numbers, number_of_cards } = require(`../config/sets/${code}.json`)

async function cardFinder(num) {
    return new Promise((resolve, reject) => {
        wtj.extractData(`https://scryfall.com/card/${code}/${num}`, {
                fields: ['data'],
                parse: function($) {
                    return {
                        TCGPlayer: $('#stores > ul > li:nth-child(1) > a:nth-child(1)').attr('href'),
                        Price: $('.tcgplayer .currency-usd').text().split("✶")
                    }
                }
            })
            .then(async function(res) {
                let tcgPlayerProductId = res.data.TCGPlayer.split("/")[4].split("?")[0]
                let results = await axios({
                    method: 'get',
                    url: `https://mp-search-api.tcgplayer.com/v1/product/${tcgPlayerProductId}/details`
                  })
                res.data.marketPrice = results.data.marketPrice
                resolve(JSON.stringify(res, null, 2))
               
            })
            .catch((error)=>{
                console.log(error.message)
            })
    })
}

function searchCard(num, mode) {
    let needsCards = missing_numbers.includes(num);
    return mode == 'need' ? needsCards : !needsCards
}

async function cardList() {
    let results = []
    for (let i = 1; i <= number_of_cards; i++) {
        if (searchCard(i, mode)) {
            let card = JSON.parse(await cardFinder(i));
            console.log(`Working on ${card.url}`)
            let min = parseFloat(card.data.Price[0].split("$")[1])
            let max = card.data.Price[1] ? parseFloat(card.data.Price[1].split("$")[1]) : min
            if (isNaN(min) && isNaN(max)) {
                min = 0
                max = 0
            }
            card.data.id = i;
            card.data.name = card.url.split("/")[6];
            card.data.url = card.url;
            card.data.PriceMin = Number.isFinite(min) ? min : max
            card.data.PriceMax = max;
            results.push(card.data);
        }
    }
    return results
}

module.exports = {
    cardList
}