const expressLib = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new expressLib.Router();

// Task requests
router.post('/api/tasks', auth, async (req, res) => {
    const task = new Task ({ ...req.body, owner: req.user._id });

    try {
        await task.save();

        return res.status(201).send(task);
    } catch(error) {
        return res.status(500).send(error.message);
    }
});


router.get('/api/tasks', auth, async (req, res) => {
    const match = {};

    if(req.query.completed) {
        match.completed = JSON.parse(req.query.completed);
    }

    const sort = {};

    if(req.query.sortBy) {
        const [field, order] = req.query.sortBy.split(':');
        sort[field] = order === 'desc' ? -1 : 1;
    }
    
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        });

        return res.send(req.user.tasks);
    } catch(error) {
        return res.status(500).send(error.message);
    }
});

router.get('/api/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if(!task) {
            return res.status(404).send();
        }

        return res.send(task);
    } catch(error) {
        return res.status(500).send(error.message);
    }
});

router.patch('/api/tasks/:id', auth, async (req, res) => {
    const keys = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];

    const isValidOperation = keys.every(key => allowedUpdates.includes(key));

    if(!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if(!task) {
            return res.status(404).send();
        }

        keys.forEach(key => task[key] = req.body[key]);
        await task.save();

        return res.send(task);
    } catch(error) {
        return res.status(400).send(error.message);
    }
});

router.delete('/api/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        if(!task) {
            return res.status(404).send();
        }

        return res.send(task);
    } catch(error) {
        return res.status(400).send(error.message);
    }
});

module.exports = router;