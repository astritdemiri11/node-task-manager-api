const jwtLib = require('jsonwebtoken');
const mongooseLib = require('mongoose');

const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const userOneId = new mongooseLib.Types.ObjectId();

const userOne = {
    _id: userOneId,
    name: 'Astrit',
    email: 'astritdemiri11@gmail.com',
    password: '20212021',
    tokens: [{
        token: jwtLib.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
};

const userTwoId = new mongooseLib.Types.ObjectId();

const userTwo = {
    _id: userTwoId,
    name: 'TiTi',
    email: 'astritdemiri06@gmail.com',
    password: '20212021',
    tokens: [{
        token: jwtLib.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
};

const tasks = [];

for (let i = 0; i < 10; i++) {
    const task = {};

    task._id = new mongooseLib.Types.ObjectId();
    task.name = `Task ${i + 1}`;
    task.description = `Description for task ${i + 1}`;
    task.completed = Math.random() < 0.5;
    task.owner = Math.random() < 0.5 ? userOneId : userTwoId;

    tasks.push(task);
}

const setupDatabase = async () => {
    await User.deleteMany();
    await Task.deleteMany();

    await new User(userOne).save();
    await new User(userTwo).save();

    for (const task of tasks) {
        await new Task(task).save();
    }
};

module.exports = {
    userOne,
    userOneId,
    userTwo,
    userTwoId,
    tasks,
    setupDatabase
}