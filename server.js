const express = require('express');
const server = express();
const scrapers = require('./scrapers.js')
const cors = require('cors')

const body_parser = require('body-parser')
server.use(body_parser.json());

const db = require('diskdb');
db.connect('./data', ['words']);
server.use(cors());

var safeModeActivated = true;

//start server 

//old
// const port = process.env.PORT;
// server.listen(port || 4000, () => {
//     console.log(`Server listening at ${port} or at 4000`);
// });


//new
server.listen(4000, 'localhost', () => {
    console.log(`Server listening at 4000`);
});



// add html route handler
server.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// CRUD / REST / Communicating with diskdb
server.get("/words", (req, res) => {
    res.json(db.words.find());
});

server.get("/words/:id", (req, res) => {
    const reqId = req.params.id;
    const item = db.words.findOne({
        index: reqId
    })

    if (item != null) {
        console.log(`\nViewing word with an id of ${reqId} \n object: ${JSON.stringify(item)}`);
        res.json(item);
    } else {
        console.log(`item ${reqId} doesn't exist`);

        res.json({
            message: `item ${reqId} doesn't exist`
        })
    }
});


server.get("/safety/:bool", (req, res) => {
    const bool = req.params.bool;
    res.json({
        message: changeSafeModeTo(bool),
        safemode: safeModeActivated
    })
});



function changeSafeModeTo(bool) {
    if (bool == 'true') {
        if (safeModeActivated == false) {
            safeModeActivated = true;
            return 'safe mode activated';

        } else {
            return 'safe mode already activated';
        }
    } else if (bool == 'false') {

        if (safeModeActivated == true) {
            safeModeActivated = false;
            return 'safe mode disabled';

        } else {
            return 'safe mode already disabled';
        }

    } else {
        return 'unknown request';
    }
}

server.post("/words", (req, res) => {

    if (!safeModeActivated) {
        const item = req.body;
        console.log('Adding new word: ', item)

        db.words.save(item);

        res.json(db.words.find());
    } else {
        res.json({
            message: 'No access'
        })
    }
})

server.put("/words/:id", (req, res) => {
    if (!safeModeActivated) {
        const itemId = req.params.id;
        const item = req.body;
        console.log(`Editing words: ${itemId} to be ${item}`);

        db.words.update({
            index: itemId
        }, item);

        res.json(db.words.find({
            index: itemId
        }));
    } else {
        res.json({
            message: 'No access'
        })
    }
});

server.delete("/words/:id", (req, res) => {
    if (!safeModeActivated) {
        const itemId = req.params.id;
        console.log(`Delete word with index: ${itemId}`);

        db.words.remove({
            index: itemId
        });

        res.json(db.words.find());
    } else {
        res.json({
            message: 'No access'
        })
    }
});

server.get("/words/exists/:word", (req, res) => {
    if (!safeModeActivated) {
        const wordFromUrl = req.params.word;

        if (isAlreadyinDB(wordFromUrl)) {
            res.json(true)
        } else {
            res.json(false)
        };
    } else {
        res.json({
            message: 'No access'
        })
    }
});

server.get("/words/random/:number", (req, res) => {
    const randNumber = req.params.number;
    var randItems = new Array();
    var arrayIDs = new Array();

    for (var i = 0; i < randNumber; i++) {

        const numb = Math.floor(
            Math.random() * (db.words.find().length + 1));

        const item = db.words.findOne({
            index: numb.toString()
        })
        console.log(`loop ${i} - Adding word with an id of ${numb}`);
        if (item !== undefined) {
            if (!arrayIDs.includes(item.index)) {
                arrayIDs.push(item.index);
                randItems.push(item);
            } else {
                console.log(`loop ${i} - duplicate item not added, index: ${item.index}`);
                i--;
            }

        } else {
            const mm = `id ${numb} did not get any results from db, this item is undefined`
            console.log(mm);
            i--;
        }
    }
    res.json(
        randItems);
});

function isAlreadyinDB(word) {
    const items = db.words.find({
        word: word
    });

    if (items.length) {
        console.log(`\nViewing word from DB: ${word} \nobject: ${JSON.stringify(items)}`);
        return true;
    } else {
        console.log(`Word ${word} is not in DB`);

        return false;
    }
}


server.get("/words/getbyword/:word", (req, res) => {
    const wordFromUrl = req.params.word;
    const item = db.words.findOne({
        word: wordFromUrl
    })

    if (item != null) {
        console.log(`\nViewing word: ${wordFromUrl} \nobject: ${JSON.stringify(item)}`);
        res.json(item);
    } else {
        console.log(`Word ${wordFromUrl} doesn't exist`);

        res.json({
            message: `Word ${wordFromUrl} doesn't exist`
        })
    }
});


//TODO get from oxford dict 

1
//workds //TODO check if word is available and then return it from the DB instead?
server.get("/words/scrapefromeki/:word", async (req, res) => {
    var word = req.params.word;
    var scrapedWord = await scrapers.scrapeWordFromEKI(word);
    res.json(scrapedWord);
})