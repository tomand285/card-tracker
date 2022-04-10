var wtj = require('website-to-json')
const open = require('open');

async function cardFinder(num) {
    return new Promise((resolve, reject) => {
        wtj.extractData(`https://scryfall.com/card/neo/${num}`, {
                fields: ['data'],
                parse: function($) {
                    return {
                        TCGPlayer: $('#stores > ul > li:nth-child(1) > a:nth-child(1)').attr('href'),
                        Price: $('.tcgplayer .currency-usd').text().split("✶")[0].split("$")[1]
                    }
                }
            })
            .then(function(res) {
                resolve(JSON.stringify(res, null, 2))
            })
    })
}

function missingCard(num) {
    let missingNumbers = [
        23, 61, 124, 208, 226, 276, 303,
        304, 305, 307, 308, 316, 320, 328, 329, 338, 343, 345, 350, 352, 354, 355, 357,
        358, 359, 360, 362, 363, 365, 366, 367, 370, 371, 372, 373, 374, 376, 377, 378, 379, 380,
        381, 382, 383, 384, 385, 389, 390, 392, 393, 395, 396, 397, 398, 399, 401, 402, 404, 405,
        406, 407, 411, 412, 416, 417, 418, 419, 420, 421, 422, 423, 424, 426, 427, 428, 429, 430,
        431, 432, 433, 434, 435, 436, 440, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 453,
        454, 455, 456, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 472, 475,
        476, 477, 479, 481, 482, 483, 484, 486, 487, 489, 490, 491, 492, 493, 494, 495, 496, 497,
        498, 499, 500, 502, 503, 504, 508, 509, 510, 511, 512
    ]
    return missingNumbers.includes(num)
}

(async() => {
    let results = []
    for (let i = 1; i <= 512; i++) {
        if (missingCard(i)) {
            let card = JSON.parse(await cardFinder(i))
            console.log(`Working on ${card.url}`)
            card.data.id = i
            card.data.name = card.url.split("/")[6]
            card.data.url = card.url
            results.push(card.data)
        }
    }
    for (let i = 0; i < results.length; i++) {
        console.log(`ID: ${results[i].id}, Card: ${results[i].url}, Price: ${results[i].Price}`)
        await open(results[i].TCGPlayer)
    }

})()