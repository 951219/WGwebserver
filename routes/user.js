const express = require('express');
const router = express.Router();
const UserModel = require('../models/userModel');
const RefreshTokenModel = require('../models/refreshToken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pino = require('pino')
const logger = pino({
    prettyPrint: {
        levelFirst: true
    },
    prettifier: require('pino-pretty')
})

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
        console.log(err.message);
        res.status(500);
    }
});


//Sign IN
router.post('/login', async (req, res) => {
    let username = req.body.username;
    let pw_plain = req.body.password;

    if (!username || !pw_plain) {
        return res.status(400).json({
            message: 'Please fill out all fields'
        });
    }

    const user = await UserModel.findOne({
        username: username
    })

    if (user == null) {
        let message = `Cannot find user ${username}`;
        logger.warn(message);
        return res.status(400).json({ message });
    }

    try {
        if (await bcrypt.compare(pw_plain, user.pw_hash)) {
            const user = { name: username };
            const accessToken = generateAccessToken(user)
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
            const tokenToSave = await RefreshTokenModel({
                token: refreshToken
            })
            await tokenToSave.save();
            res.json({ accessToken: accessToken, refreshToken: refreshToken });
        } else {
            let message = `User ${username} is not allowed here`;
            logger.warn(message);
            res.json({ message });
        }
    } catch (err) {
        logger.error(err.message);
        res.status(500).send(err.message);
    }
});

// Deleting the refreshtoken/loggin out, so the customer has to generate a new one once they log in again.
router.delete('/logout', async (req, res) => {
    try {
        await RefreshTokenModel.deleteOne({
            token: req.body.token
        });
    } catch (err) {
        logger.warn(err.message);
        res.status(500).json(err.message);
    }
    res.sendStatus(204);
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
});

//Endpoint for creating a new access token
router.post('/token', async (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) { return res.sendStatus(401); };
    let tokenFromDB = await RefreshTokenModel.findOne({ token: refreshToken });
    if (tokenFromDB == null) { return res.sendStatus(403); };
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log(err.message);
            return res.sendStatus(403);
        }
        const accessToken = generateAccessToken({ name: user.name });
        res.json({ accessToken: accessToken });

    });


});
function authorizeUser(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) { return res.sendStatus(403); }
        logger.info(`User "${user.name}" authorized`);
        req.user = user;
        next();
    })
}

function generateAccessToken(user) {
    logger.info(`${user.name} logged in`)
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
}

async function getUserInfo(username) {
    try {
        const user = await UserModel.findOne({
            username: username
        })
        return user;
    }
    catch (err) {
        return { message: err.message };
    }

}

module.exports = {
    router: router,
    authorizeUser: authorizeUser,
    getUserInfo: getUserInfo
};
