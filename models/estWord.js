const mongoose = require('mongoose');

const estWordSchema = new mongoose.Schema({
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
    },
    _id: {
        type: String,
        required: true
    }
})


module.exports = mongoose.model('est', estWordSchema);