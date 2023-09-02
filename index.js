const open = require('open');
const nodeFlags = require('node-flag');
const { code } = nodeFlags.getAll();
const { cardList } = require('./src/card-helper');
let { stats } = require(`./config/sets/${code}.json`);

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

(async() => {
    let results = await cardList()

    let total = results.length;
    let totalPrice = 0;

    let lookAt = async(card) => {
        console.log(`ID: ${card.id}, Card: ${card.url}, Price: ${card.cardPrice}`);
        // await open(card.TCGPlayer)
        // await sleep(1000*10)
    }

    for (let i = 0; i < total; i++) {
        totalPrice += results[i].cardPrice

        for (let j = 0; j < stats.length; j++) {
            let stat = stats[j]

            if (results[i].cardPrice < stat.limit) {
                if (!j) {
                    await lookAt(results[i])
                }

                stat.amount++;
                stat.cardPrice += results[i].cardPrice;
            }
        }
    }

    for (let j = 0; j < stats.length; j++) {
        let stat = stats[j]
        stat.cardPrice = parseFloat(stat.cardPrice.toFixed(2));
    }

    console.log(`Total number of cards left: ${total}`)
    console.log(`Total price of all cards left: $${totalPrice.toFixed( 2 )}`)
    console.table(stats)
})()