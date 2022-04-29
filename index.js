const fs = require('fs')
var wtj = require('website-to-json')
const open = require('open');
const currDate = (new Date()).toISOString().replace(/:/g, '_')

async function cardFinder(num) {
    return new Promise((resolve, reject) => {
        wtj.extractData(`https://scryfall.com/card/neo/${num}`, {
                fields: ['data'],
                parse: function($) {
                    return {
                        TCGPlayer: $('#stores > ul > li:nth-child(1) > a:nth-child(1)').attr('href'),
                        Price: $('.tcgplayer .currency-usd').text().split("✶")
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
        7, 200, 303, 305, 307, 308, 316, 320, 328, 343, 345, 350, 351, 352, 357, 359, 362, 365, 367, 371, 372,
        374, 376, 377, 385, 392, 397, 398, 402, 404, 406, 411, 412, 416, 417, 418, 419, 420, 421, 422, 423, 424,
        426, 427, 428, 429, 430, 431, 432, 433, 436, 440, 445, 446, 449, 453, 456, 459, 463, 465, 477, 486, 495,
        498, 502, 503, 504, 508, 509, 510, 512
    ]
    return missingNumbers.includes(num);
}

(async() => {
    let results = []
    for (let i = 1; i <= 512; i++) {
        if (missingCard(i)) {
            let card = JSON.parse(await cardFinder(i));
            console.log(`Working on ${card.url}`)
            card.data.id = i;
            card.data.name = card.url.split("/")[6];
            card.data.url = card.url;
            card.data.Price = Number.isFinite(card.data.Price[0].split("$")[1]) ?
                card.data.Price[0].split("$")[1] :
                card.data.Price[1].split("$")[1]
            card.data.Price = parseFloat(card.data.Price);
            results.push(card.data);
        }
    }

    let total = results.length;
    let totalPrice = 0;
    let amount = 0;
    let price = 0;
    let limit = 3; //5
    let amount2 = 0;
    let price2 = 0;
    let limit2 = 4; //10
    let amount3 = 0;
    let price3 = 0;
    let limit3 = 5; //20
    let amount4 = 0;
    let price4 = 0;
    let limit4 = 50;
    let amount5 = 0;
    let price5 = 0;
    let limit5 = 100;

    let writer = async(log) => {
        console.log(log)
        try {
            fs.writeFileSync(`neo-${currDate}.txt`, log + "\n", { flag: 'a+' })
        } catch (err) {
            console.error(err)
        }
    }

    let lookAt = async(card) => {
        await writer(`ID: ${card.id}, Card: ${card.url}, Price: ${card.Price}`);
        await open(card.TCGPlayer)
    }

    for (let i = 0; i < total; i++) {
        totalPrice += results[i].Price

        if (results[i].Price < limit) {
            amount++
            price += results[i].Price
            await lookAt(results[i])
        }

        if (results[i].Price < limit2) {
            amount2++
            price2 += results[i].Price
        }

        if (results[i].Price < limit3) {
            amount3++
            price3 += results[i].Price
        }

        if (results[i].Price < limit4) {
            amount4++
            price4 += results[i].Price
        }

        if (results[i].Price < limit5) {
            amount5++
            price5 += results[i].Price
        }

    }

    await writer(`Total number of cards left: ${total}`)
    await writer(`Total price of all cards left: $${totalPrice.toFixed( 2 )}`)
    await writer(`Number of cards under $${limit}: ${amount}`)
    await writer(`Total price of ${amount} cards under $${limit}: $${price.toFixed( 2 )}`)
    await writer(`Number of cards under $${limit2}: ${amount2}`)
    await writer(`Total price of ${amount2} cards under $${limit2}: $${price2.toFixed( 2 )}`)
    await writer(`Number of cards under $${limit3}: ${amount3}`)
    await writer(`Total price of ${amount3} cards under $${limit3}: $${price3.toFixed( 2 )}`)
    await writer(`Number of cards under $${limit4}: ${amount4}`)
    await writer(`Total price of ${amount4} cards under $${limit4}: $${price4.toFixed( 2 )}`)
    await writer(`Number of cards under $${limit5}: ${amount5}`)
    await writer(`Total price of ${amount5} cards under $${limit5}: $${price5.toFixed( 2 )}`)
})()