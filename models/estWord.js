const mongoose = require('mongoose');
// TODO word incasesensitive
const newEstWordSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true,
        unique: true
    },
    meaning: {
        type: [String],
        required: true
    },
    example: [String],
    timeAdded: {
        type: Date,
        required: true,
    },
    wordId: {
        type: Number,
        required: true,
        unique: true
    }
});


module.exports = mongoose.model('estWord', newEstWordSchema);