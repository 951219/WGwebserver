const express = require('express');
const server = express();

const body_parser = require('body-parser')
server.use(body_parser.json());

const db = require('diskdb');
db.connect('./data', ['movies']);
// The syntax is: db.connect('/path/to/db-folder', ['collection-name']);

// add json route handler
server.get("/json", (req, res) => {
    res.json({
        message: "Hello world"
    });
});

//add html route handler
server.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.get("/info", (req, res) => {
    res.sendFile(__dirname + '/info.html');
});

//start server 

const port = 4000;

server.listen(port, () => {
    console.log(`Server listening at ${port}`);
});



let data = require('./data')


server.get("/items", (req, res) => {
    res.json(data);
});

server.get("/items/:id", (req, res) => {
    const itemId = req.params.id;
    const item = data.find(_item => _item.id === itemId);

    if (item) {
        res.json(item);
    } else {
        res.json({
            message: `item ${itemId} doesn't exist`
        })
    }
});


server.post("/items", (req, res) => {
    const item = req.body;
    console.log('Adding new item: ', item)

    data.push(item);

    res.json(data);
})

server.put("/items/:id", (req, res) => {
    const itemId = req.params.id;
    const item = req.body;
    console.log("Editing item: ", itemId, " to be ", item);
 
    const updatedListItems = [];
    // loop through list to find and replace one item
    data.forEach(oldItem => {
       if (oldItem.id === itemId) {
          updatedListItems.push(item);
       } else {
          updatedListItems.push(oldItem);
       }
    });
 
    // replace old list with new one
    data = updatedListItems;
 
    res.json(data);
 });

 server.delete("/items/:id", (req, res) => {
    const itemId = req.params.id;
 
    console.log("Delete item with id: ", itemId);
 
    const filtered_list = data.filter(item => item.id !== itemId);
 
    data = filtered_list;
    res.json(data);
 });

 if (!db.movies.find().length) {
    const movie = { id: "tt0110358", name: "The Tiger King", genre: "animation" };
    db.movies.save(movie);
 }
 console.log(db.movies.find());


 //kuuenda juures pooleli. https://dev.to/lenmorld/quick-database-with-node-express-and-diskdb-in-5-minutes-1jjj