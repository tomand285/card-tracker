var wtj = require('website-to-json')
const open = require('open');

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
    let limit = 5;
    let amount2 = 0;
    let price2 = 0;
    let limit2 = 10;
    let amount3 = 0;
    let price3 = 0;
    let limit3 = 20;
    let amount4 = 0;
    let price4 = 0;
    let limit4 = 50;
    let amount5 = 0;
    let price5 = 0;
    let limit5 = 100;

    let lookAt = async(card) => {
        console.log(`ID: ${card.id}, Card: ${card.url}, Price: ${card.Price}`);
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

    console.log(`Total number of cards left: ${total}`)
    console.log(`Total price of all cards left: $${totalPrice.toFixed( 2 )}`)
    console.log(`Number of cards under $${limit}: ${amount}`)
    console.log(`Total price of ${amount} cards under $${limit}: $${price.toFixed( 2 )}`)
    console.log(`Number of cards under $${limit2}: ${amount2}`)
    console.log(`Total price of ${amount2} cards under $${limit2}: $${price2.toFixed( 2 )}`)
    console.log(`Number of cards under $${limit3}: ${amount3}`)
    console.log(`Total price of ${amount3} cards under $${limit3}: $${price3.toFixed( 2 )}`)
    console.log(`Number of cards under $${limit4}: ${amount4}`)
    console.log(`Total price of ${amount4} cards under $${limit4}: $${price4.toFixed( 2 )}`)
    console.log(`Number of cards under $${limit5}: ${amount5}`)
    console.log(`Total price of ${amount5} cards under $${limit5}: $${price5.toFixed( 2 )}`)
})()