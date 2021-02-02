const express = require('express');
const router = express.Router();
const UserModel = require('../models/userModel');

//testing
router.get('/getinfowithuserid/:id', async (req, res) => {
    var id = req.params.id;
    try {
        const user = await UserModel.findOne({
            user_id: id
        })
        console.log(`Found the user, returning it`)
        res.status(200).json(user);
    }
    catch (err) {
        console.log(err.message)
        res.status(500).json({ message: err.message })
    }
});

module.exports = router;
