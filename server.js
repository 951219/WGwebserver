const express = require('express');
const server = express();
const scrapers = require('./scrapers.js')
const cors = require('cors')

const body_parser = require('body-parser')
server.use(body_parser.json());

const db = require('diskdb');
db.connect('./data', ['words']);
// The syntax is: db.connect('/path/to/db-folder', ['collection-name']);


var safeModeActivated = true;

// add json route handler
// server.get("/json", (req, res) => {
//     res.json({
//         message: "Hello world"
//     });
// });
server.use(cors());


// add html route handler
server.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// server.get("/info", (req, res) => {
//     res.sendFile(__dirname + '/info.html');
// });

//start server 
const port = process.env.PORT;
server.listen(port || 4000, () => {
    console.log(`Server listening at ${port} or at 4000`);
});


// CRUD / REST / DISKDBga suhtlus
server.get("/words", (req, res) => {

    res.json(db.words.find());
});

server.get("/words/:id", (req, res) => {
    const reqId = req.params.id;
    const item = db.words.findOne({
        id: reqId
    })

    if (item != null) {
        console.log('\nViewing word with an id of ' + reqId + "\nobject: " + JSON.stringify(item));
        res.json(item);
    } else {
        console.log(`item ${reqId} doesn't exist`);

        res.json({
            message: `item ${reqId} doesn't exist`
        })
    }
});

server.get("/wordsobject/:id", (req, res) => {
    const reqId = req.params.id;
    const [items] = db.words.find({
        id: reqId
    })

    if (items != null) {
        res.json(items);
    } else {
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
        console.log("Editing words: ", itemId, " to be ", item);

        db.words.update({
            id: itemId
        }, item);

        res.json(db.words.find({
            id: itemId
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
        console.log("Delete word with id: ", itemId);

        db.words.remove({
            id: itemId
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

        const numb = getRandomInt(db.words.find().length);

        const item = db.words.findOne({
            id: numb.toString()
        })
        console.log(`loop ${i} - Adding word with an id of ` + numb);
        if (item !== undefined) {
            if (!arrayIDs.includes(item.id)) {
                arrayIDs.push(item.id);
                randItems.push(item);
            } else {
                console.log(`loop ${i} - duplicate item not added, id: ${item.id}`);
                i--;
            }

        } else {
            const mm = `id ${numb} did not get any results from db, this item is undefined`
            console.log(mm);
            i--;
        }
    }
    res.json(randItems);
});




function getRandomInt(max) {
    return Math.floor(
        Math.random() * (max + 1)
    )
}

//testdata juhuks kui db tyhi
// if (!db.words.find().length) {

//     var fs = require('fs');

//     fs.readFile('wordsOld.txt', 'utf8', function (error, data) {

//         var lines = data.split('\n');

//         for (var line = 0; line < lines.length; line++) {
//             var sLine = lines[line];
//             sLine = sLine.split(' /// ');

//             const word = {
//                 id: line.toString(),
//                 tries: sLine[0],
//                 word: sLine[1],
//                 definition: sLine[2]
//             };

//             console.log(word);

//             db.words.save(word);
//         }
//     });
// }

function isAlreadyinDB(word) {
    const items = db.words.find({
        word: word
    });

    if (items.length) {
        console.log('\nViewing word from DB: ' + word + "\nobject: " + JSON.stringify(items));
        return true;
    } else {
        console.log(`Word ${word} is not in DB`);

        return false;
    }
}
//TODO take from EKI / oxford dict etc

//checking if the word exists in db by name
// server.get("/words/exists/:word", (req, res) => {
//     if (!safeModeActivated) {
//         const wordFromUrl = req.params.word;

//         if (isAlreadyinDB(wordFromUrl)) {
//             res.json(true)
//         } else {
//             res.json(false)
//         };
//     } else {
//         res.json({ message: 'No access' })
//     }
// });

//get word by name
server.get("/words/getbyword/:word", (req, res) => {
    const wordFromUrl = req.params.word;
    const items = db.words.find({
        word: wordFromUrl
    })

    if (items.length) {
        console.log('\nViewing word: ' + wordFromUrl + "\nobject: " + JSON.stringify(items));
        res.json(items);
    } else {
        console.log(`Word ${wordFromUrl} doesn't exist`);

        res.json({
            message: `Word ${wordFromUrl} doesn't exist`
        })
    }
});


//workds //TODO check if word is available and then return it from the DB instead?
server.get("/words/scrapefromeki/:word", async (req, res) => {
    var word = req.params.word;
    var scrapedWord = await scrapers.scrapeWordFromEKI(word);
    res.json(scrapedWord);
})