const mongoose = require('mongoose');

const engWordSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true
    },
    definition: {
        type: [String],
        required: true
    },
    example: [String],
    score: {
        type: String,
        default: "0"
    }
})

module.exports = mongoose.model('eng', engWordSchema);