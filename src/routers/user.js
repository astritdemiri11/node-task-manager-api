const expressLib = require('express');
const multerLib = require('multer');
const sharpLib = require('sharp');

const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account');

const router = new expressLib.Router();

// User Requests
router.post('/api/users/signup', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);

        const token = await user.generateAuthToken();

        return res.status(201).send({ user, token });
    } catch(error) {
        return res.status(400).send(error.message);
    }
});

router.post('/api/users/login', async (req, res) => {
    const body = req.body;

    try {
        const user = await User.findByCredentials(body.email, body.password);
        const token = await user.generateAuthToken();

        return res.send({ user, token });
    } catch(error) {
        return res.status(400).send(error.message);
    }
});

router.post('/api/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);

        await req.user.save();

        return res.send();
    } catch(error) {
        return res.status(500).send(error.message);
    }
});

router.post('/api/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        return res.send();
    } catch(error) {
        return res.status(500).send(error.message);
    }
});

router.get('/api/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if(!user || !user.avatar) {
            throw new Error('Avatar not found');  
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send(error.message);
    }
});

const avatarUpload = multerLib({ 
    // dest: 'public/img/avatar',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            callback(new Error('Please upload an image file!'));
        }

        callback(undefined, true);
    }
});

router.post('/api/users/me/avatar', auth, avatarUpload.single('img'), async (req, res) => {
    const buffer = await sharpLib(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();

    req.user.avatar = buffer;
    await req.user.save();

    res.status(201).send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

router.delete('/api/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();

    res.send();
});

const personalDataUpload = multerLib({ 
    dest: 'public/doc/personal',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {
        if(!file.originalname.match(/\.(doc|docx)$/)) {
            return callback(new Error('Please upload a Word document!'));
        }

        callback(undefined, true);
    }
});

router.post('/api/users/me/doc', personalDataUpload.single('doc'), (req, res) => {
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

router.get('/api/users/me', auth , async (req, res) => {
    try {
        return res.send(req.user);
    } catch(error) {
        return res.status(500).send(error.message);
    }
});

router.patch('/api/users/me', auth, async (req, res) => {
    const body = req.body;
    const keys = Object.keys(body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];

    const isValidOperation = keys.every(key => allowedUpdates.includes(key));
    
    if(!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        keys.forEach(key => req.user[key] = body[key]);
        await req.user.save();

        return res.send(req.user);
    } catch(error) {
        return res.status(400).send(error.message);
    }
});

router.delete('/api/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancellationEmail(req.user.email, req.user.name);

        res.send(req.user);
    } catch(error) {
        return res.status(400).send(error.message);
    }
});

module.exports = router;