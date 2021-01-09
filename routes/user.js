const express = require('express');
const router = express.Router();
const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

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
            const user = { name: username };
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
            res.json({ accessToken: accessToken });
        } else {
            res.json({ message: 'Not allowed' });
        }
    } catch {
        res.status(500).send();
    }
});

router.get('/getinfo', authorizeUser, async (req, res) => {
    try {
        const user = await UserModel.findOne({
            username: req.user.name
        })
        res.status(200).json(user);
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

function authorizeUser(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) { return res.sendStatus(403); }
        console.log(`User "${user.name}" authorized`);
        req.user = user;
        next();
    })
}

//TODO revoking access from an user, refreshtokens

module.exports = {
    router: router,
    authorizeUser: authorizeUser
};
