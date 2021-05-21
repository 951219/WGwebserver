const mongoose = require('mongoose');

const brokenWordSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    wordId: {
        type: Number,
        required: true,
        unique: true
    },
    lang: {
        type: String,
        required: true
    },
});


module.exports = mongoose.model('brokenWord', brokenWordSchema);