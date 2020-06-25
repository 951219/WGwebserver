const scrapers = require('./scrapers.js')
// scrapers.scrapeDefinition('kass')

const db = require('diskdb');
db.connect('./data', ['words']);
// db.connect('./data', ['wordsNew']);


for (i = 0; i < 3; i++) {
    const item = db.words.findOne({
        id: i.toString()
    })

    console.log(item.word);


    if (item != null) {
        console.log('id in db \n checking EKI');
        setTimeout(() => {
            scrapers.scrapeDefinition(item.word)
        }
            , 2000);
    } else {
        console.log('id does not exist');
    }
}

//pooleli