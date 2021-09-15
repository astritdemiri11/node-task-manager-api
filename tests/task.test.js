const requestLib = require('supertest');

const app = require('../src/app');
const Task = require('../src/models/task');
const { 
    userOne, 
    userOneId, 
    userTwo, 
    userTwoId, 
    tasks, 
    setupDatabase 
} = require('./fixtures/db.js');

beforeEach(setupDatabase);

test('Should create task for user.', async () => {
    const result = await requestLib(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'From my test'
        })
        .expect(201);

    const task = await Task.findById(result.body._id);

    expect(task).not.toBeNull();
    expect(task.completed).toBeFalsy();
});

test('Should fetch user tasks.', async () => {
    const result = await requestLib(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const tasks = result.body;

    for (const task of tasks) {
        expect(task).toHaveProperty('owner', userOneId.toHexString());
    }
});

test('Should not delete non owning tasks', async () => {
    const taskUserOne = tasks.find(task => task.owner === userOne._id);

    if (taskUserOne) {
        await requestLib(app)
            .delete(`/api/tasks/${taskUserOne._id}`)
            .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
            .send()
            .expect(404);

        const task = await Task.findById(taskUserOne._id);

        expect(task).not.toBeNull();
    }
});