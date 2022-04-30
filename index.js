const fs = require('fs')
const open = require('open');
const { cardList } = require('./src/card-helper')
let stats = require("./config/stats.json")
const currDate = (new Date()).toISOString().replace(/:/g, '_');

(async() => {
    let results = await cardList()

    let total = results.length;
    let totalPriceMin = 0;
    let totalPriceMax = 0;

    let writer = async(log) => {
        console.log(log)
        try {
            fs.writeFileSync(`neo-${currDate}.txt`, log + "\n", { flag: 'a+' })
        } catch (err) {
            console.error(err)
        }
    }

    let lookAt = async(card) => {
        await writer(`ID: ${card.id}, Card: ${card.url}, PriceMin: ${card.PriceMin}, PriceMax: ${card.PriceMax}`);
        //await open(card.TCGPlayer)
    }

    for (let i = 0; i < total; i++) {
        totalPriceMin += results[i].PriceMin
        totalPriceMax += results[i].PriceMax

        for (let j = 0; j < stats.length; j++) {
            let stat = stats[j]

            if (!j) {
                //await lookAt(results[i])
            }

            if (results[i].PriceMin < stat.limit) {
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

    await writer(`Total number of cards left: ${total}`)
    await writer(`Total priceMin of all cards left: $${totalPriceMin.toFixed( 2 )}`)
    await writer(`Total priceMx of all cards left: $${totalPriceMax.toFixed( 2 )}`)
    console.table(stats)
})()