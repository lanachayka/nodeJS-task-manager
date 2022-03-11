const express = require('express');
const User = require('../models/user');
const authMiddelware = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');

const router = new express.Router();

// Create new user
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        // sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

// Login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token});
    } catch (e) {
        res.status(400).send(e);
    }
});

//Logout
router.post('/users/logout', authMiddelware, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
});

//Logout all
router.post('/users/logoutAll', authMiddelware, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
});

// Read profile
router.get('/users/me', authMiddelware, async (req, res) => {
    res.send(req.user);
});

// Update user
router.patch('/users/me', authMiddelware, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        res.status(201).send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Delete user
router.delete('/users/me', authMiddelware, async (req, res) => {
    try {
        await req.user.remove();
        // sendCancelationEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Configure multer
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
            return cb(new Error('Please upload an image'));
        }
        cb(undefined, true)
    }
});

// Upload avatar
router.post('/users/me/avatar', authMiddelware, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
});

//Delete avatar
router.delete('/users/me/avatar', authMiddelware, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

// Fetch avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', 'image/png');    
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send(e);
    }
});

module.exports = router;
