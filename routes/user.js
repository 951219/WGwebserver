const express = require('express');
const router = express.Router();
const UserModel = require('../models/userModel');

//TODO rafactor, current solution is for testing only
router.get('/create/:firstname/:lastname/:number', async (req, res) => {
    let firstname = req.params.firstname;
    let lastname = req.params.lastname;
    let userid = req.params.number;

    const entry = UserModel({
        user_id: userid,
        first_name: firstname,
        last_name: lastname
    });

    try {
        await entry.save();
        res.json({ message: `User ${firstname} ${lastname} created, ID: ${userid}` });

    } catch (err) {
        res.json(err.message)
    }
});


router.get('/getinfo/:id', async (req, res) => {
    let id = req.params.id;
    let data = await UserModel.findOne({
        user_id: id
    })

    if (data.length !== 0) {
        res.json(data);
    } else {
        res.json({ message: `User with id ${id} not found` });
    }
})

//TODO pulling user data as a middleware and working with that from there?

module.exports = router;