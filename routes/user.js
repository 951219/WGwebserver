const express = require('express');
const router = express.Router();
const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

//Sign up
router.get('/signup', (req, res) => {
    // TODO HTML form to fill so the user could sign up
    res.json('HTML form to fill so the user could sign up')
})

//Sign up
router.post('/signup', async (req, res) => {
    let username = req.body.username;
    let pw_plain = req.body.password;
    let userid = crypto.randomBytes(20).toString('hex');

    try {
        const hashedPassword = await bcrypt.hash(pw_plain, 10);
        const user = UserModel({
            user_id: userid,
            username: username,
            pw_hash: hashedPassword
        });
        await user.save();
        res.status(201).json({ message: `User ${username} created, ID: ${userid}` });
    } catch (err) {
        res.status(500).json(err.message);
    }
});


//Sign IN
router.post('/login', async (req, res) => {
    let username = req.body.username;
    let pw_plain = req.body.password;

    const user = await UserModel.findOne({
        username: username
    })
    console.log(user);

    if (user == null) {
        return res.status(400).json({ message: 'Cannot find user' });
    }

    try {
        if (await bcrypt.compare(pw_plain, user.pw_hash)) {
            res.json({ message: 'Success' });
        } else {
            res.send({ message: 'Not allowed' });
        }
    } catch {
        res.status(500).send();
    }
})

// router.get('/getinfo/:userid', async (req, res) => {
//     let id = req.params.userid;
//     let data = await UserModel.findOne({
//         user_id: id
//     })

//     if (data !== null) {
//         res.json(data);
//     } else {
//         res.json({ message: `User with id ${id} not found` });
//     }
// })

//TODO pulling user data as a middleware and working with that from there?

module.exports = router;