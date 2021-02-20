const express = require('express');
const router = express.Router();
const UserModel = require('../models/userModel');
const RefreshTokenModel = require('../models/refreshToken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const logger = require('pino')({
    prettyPrint: {
        levelFirst: true
    },
    prettifier: require('pino-pretty')
});

//Sign up
router.get('/signup', (req, res) => {
    // TODO HTML form to fill so the user could sign up
    res.json('HTML form to fill so the user could sign up');
});


//Sign up
router.post('/signup', async (req, res) => {
    let username = req.body.username.toLowerCase();
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
        let message = `User ${username} created, ID: ${userid}`;
        logger.info(message);
        res.status(201).json({ message });
    } catch (err) {
        logger.error(err.message);
        res.status(500);
    };
});


//Sign IN
router.post('/login', async (req, res) => {
    let username = req.body.username;
    let pw_plain = req.body.password;

    if (!username || !pw_plain) {
        let message = 'Please fill out all fields';
        logger.warn(message);
        return res.status(400).json({ message });
    };

    const user = await UserModel.findOne({
        username: username
    });

    if (user == null) {
        let message = `Cannot find user ${username}`;
        logger.warn(message);
        return res.status(400).json({ message });
    };

    try {
        if (await bcrypt.compare(pw_plain, user.pw_hash)) {

            const userid = user.user_id;
            console.log(userid);
            const accessToken = await generateAccessToken(userid);
            const refreshToken = jwt.sign({ user_id: userid }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '90 days' });
            const tokenToSave = await RefreshTokenModel({
                token: refreshToken,
                user_id: userid
            });
            await tokenToSave.save();
            logger.info(`Returning tokens for ${userid}`);
            res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken });
        } else {
            let message = `User ${username} is not allowed here`;
            logger.warn(message);
            res.json({ message });
        }
    } catch (err) {
        logger.error(err.message);
        res.status(500).send(err.message);
    };
});

// TODO Deleting the refreshtoken/loggin out, so the customer has to generate a new one once they log in again.
router.post('/logout', async (req, res) => {
    try {
        await RefreshTokenModel.deleteOne({
            token: req.body.token
        });
        logger.info('Logged out');
        res.sendStatus(204);
    } catch (err) {
        logger.error(err.message);
        res.status(500).json({ message: err.message });
    };
});

router.get('/getinfo', authorizeUser, async (req, res) => {
    try {
        const user = await UserModel.findOne({
            user_id: req.user_id
        });
        logger.info(`Found the user ${user.user_id}, returning it`);
        res.status(200).json(user);
    } catch (err) {
        logger.error(err.message);
        res.status(500).json({ message: err.message });
    };
});

//Endpoint for checking and creating a new access token if necessary
router.post('/token', async (req, res) => {
    const { refreshToken } = req.body;
    const { accessToken } = req.body;
    let resAccessToken;

    if (refreshToken == null) { logger.warn('RefreshToken is null'); return res.sendStatus(401); };
    let tokenFromDB = await RefreshTokenModel.findOne({ token: refreshToken });
    if (tokenFromDB == null) { logger.info('RefreshToken not found in DB'); return res.sendStatus(403); };

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, object) => {
        if (err) {
            logger.error(err.message);
            return res.status(403).json({ message: err.message });
        }
        logger.info(`RefreshToken is valid for ${object.user_id}`);
        resAccessToken = await generateAccessToken(object.user_id);
        // logger.info(resAccessToken);
    });
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, user_id) => {
        if (err) {
            logger.error(err.message);
            if (err.message == "jwt expired") {
                logger.info(`accessToken status: ${err.message}, creating a new one`);
                await generateAccessToken(user_id);
            } else {
                logger.info(`accessToken status: ${err.message}`);
                res.json({ message: err.message });
            };
        } else {
            logger.info('All good, why you here');
        };
    });

    res.status(200).json({ accessToken: resAccessToken });
});


function authorizeUser(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        logger.warn(`Token is null`);
        return res.sendStatus(401);
    };

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            logger.error(err.message);
            return res.status(403).json({ message: err.message });
        };
        logger.info(`User "${user.user_id}" authorized`);
        req.user_id = user.user_id;
        next();
    });
};

async function generateAccessToken(user_id) {
    logger.info(`Generating access token for ${user_id}`);
    return jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '45s' });
};

async function getUserInfo(username) {
    try {
        const user = await UserModel.findOne({
            username: username
        });
        logger.info(`Got information for ${username}, returning it`);
        return user;
    } catch (err) {
        logger.error(err.message);
        return { message: err.message };
    };

};

module.exports = {
    router: router,
    authorizeUser: authorizeUser,
    getUserInfo: getUserInfo
};
