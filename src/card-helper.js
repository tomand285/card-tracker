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
                        TCGPlayer: $('#stores > ul > li:nth-child(1) > a:nth-child(1)').attr('href')
                    }
                }
            })
            .then(async function(res) {
                let tcgPlayerProductId = res.data.TCGPlayer.split("/")[4].split("?")[0]
                let results = await axios({
                    method: 'post',
                    url: `https://mp-search-api.tcgplayer.com/v1/product/${tcgPlayerProductId}/listings?mpfev=1773`,
                    data: {
                        "filters": {
                            "term": {
                                "sellerStatus": "Live",
                                "channelId": 0,
                                "language": [
                                    "English"
                                ],
                                "direct-seller": true,
                                "directProduct": true,
                                "listingType": "standard"
                            },
                            "range": {
                                "quantity": {
                                    "gte": 1
                                },
                                "direct-inventory": {
                                    "gte": 1
                                }
                            },
                            "exclude": {
                                "channelExclusion": 0,
                                "listingType": "custom"
                            }
                        },
                        "from": 0,
                        "size": 1,
                        "context": {
                            "shippingCountry": "US",
                            "cart": {}
                        },
                        "sort": {
                            "field": "price+shipping",
                            "order": "asc"
                        }
                    }
                  })
                if(results.data.results[0].results.length == 0){
                    results = await axios({
                        method: 'post',
                        url: `https://mp-search-api.tcgplayer.com/v1/product/${tcgPlayerProductId}/listings?mpfev=1773`,
                        data: {
                            "context": {
                                "cart": {
                                },
                                "shippingCountry": "US"
                            },
                            "filters": {
                                "exclude": {
                                    "channelExclusion": 0,
                                    "listingType": "custom"
                                },
                                "range": {
                                    "quantity": {
                                        "gte": 1
                                    }
                                },
                                "term": {
                                    "channelId": 0,
                                    "language": [
                                        "English"
                                    ],
                                    "listingType": "standard",
                                    "sellerStatus": "Live"
                                }
                            },
                            "from": 0,
                            "size": 1,
                            "sort": {
                                "field": "price+shipping",
                                "order": "asc"
                            }
                        }})
                }
                res.data.cardPrice = results.data.results[0].results[0].price
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
            card.data.id = i;
            card.data.name = card.url.split("/")[6];
            card.data.url = card.url;
            results.push(card.data);
        }
    }
    return results
}

module.exports = {
    cardList
}