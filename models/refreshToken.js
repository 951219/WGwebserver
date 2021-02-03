const mongoose = require('mongoose');

const refreshToken = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    }
})


module.exports = mongoose.model('refreshToken', refreshToken);