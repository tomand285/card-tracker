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
    let totalPriceMin = 0;
    let totalPriceMax = 0;

    let lookAt = async(card) => {
        console.log(`ID: ${card.id}, Card: ${card.url}, PriceMin: ${card.PriceMin}, PriceMax: ${card.PriceMax}`);
        // await open(card.TCGPlayer)
        // await sleep(1000*10)
    }

    for (let i = 0; i < total; i++) {
        totalPriceMin += results[i].PriceMin
        totalPriceMax += results[i].PriceMax

        for (let j = 0; j < stats.length; j++) {
            let stat = stats[j]

            if (results[i].PriceMin < stat.limit) {
                if (!j) {
                    await lookAt(results[i])
                }

                stat.amount++;
                stat.priceMin += results[i].PriceMin;
                stat.priceMax += results[i].PriceMax;
            }
        }
    }

    for (let j = 0; j < stats.length; j++) {
        let stat = stats[j]
        stat.priceMin = parseFloat(stat.priceMin.toFixed(2));
        stat.priceMax = parseFloat(stat.priceMax.toFixed(2));
    }

    console.log(`Total number of cards left: ${total}`)
    console.log(`Total priceMin of all cards left: $${totalPriceMin.toFixed( 2 )}`)
    console.log(`Total priceMax of all cards left: $${totalPriceMax.toFixed( 2 )}`)
    console.table(stats)
})()