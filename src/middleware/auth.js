const jwtLib = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        let token = req.header('Authorization');

        if(!token) {
            throw new Error('Please Authenticate');
        }

        token = token.replace('Bearer ', '')

        const decoded = jwtLib.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.id, 'tokens.token': token });

        if(!user) {
            throw new Error('Please Authenticate');
        }

        req.token = token;
        req.user = user;

        next();
    } catch(error) {
        res.status(401).send({ error: error.message });
    }
};

module.exports = auth;