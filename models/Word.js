const mongoose = require('mongoose');

const WordSchema = mongoose.Schema({
    word: {
        type: String,
        required: true
    },
    definition: {
        type: String,
        required: true
    },
    example: String,
})

module.exports = mongoose.model('Words', WordSchema);